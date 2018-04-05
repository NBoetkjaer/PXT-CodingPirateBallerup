namespace codingpirates {
    
    /**
     * Enumeration of Side eg. Left/Right
     */
    export enum Side {

         //% blockId=cp_steering_left
         //% block="left"
         Left,
         //% blockId=cp_steering_right
         //% block="right"
         Right
    }

    let CommandRunning = false;
    // PID Regulator variables.
    let P = 4;
    let I = 5;
    let D = 0;
    // P Regulator for differential steering.
    let P_diff = 100;

    const LoopFrequency = 50; // Hz
    let DeltaT = 1000/LoopFrequency; // Control loop delay in milliseconds.	

    /**
     * Drive forward by the specified amount. If another command is already running the forward command is discarded.
     * @param distance_cm distance to drive forward in centimeters eg.: 25
     */
    //% subcategory=Steering
    //% weight=100, blockGap=8
    //% blockId=cp_steering_forward
    //% block="drive forward %distance_cm |centimeters"
    export function forward(distance_cm: number):void {
        let encStopPos = Math.abs(distance_cm * 10); // Convert centimeters to millimeter.
        let direction = MotorDirection.Forward;
        if (distance_cm < 0){
            direction = MotorDirection.Reverse;
        }		
        runCommand(encStopPos, direction, direction);
    }

    /**
     * Drive backwards by the specified amount. If another command is already running the backward command is discarded.
     * @param distance_cm distance to drive backwards in centimeters eg.: 25
     */
    //% subcategory=Steering
    //% weight=90
    //% blockId=cp_steering_backward
    //% block="drive backward %distance_cm |centimeters"
    export function backward(distance_cm: number):void {
        forward(-1*distance_cm);
    }

    /**
     * Turn right by the specified amount 'angle' degree. If another command is already running the turn command is discarded.
     * @param angle in degree eg.: 90
     */
    //% subcategory=Steering
    //% weight=80, blockGap=8
    //% blockId=cp_steering_turn_right
    //% block="turn right  %angle |degrees"
    export function turnRight(angle: number):void {
        // Distance between wheels is 155 mm;
        // Circle circumference is pi*155 = 487 which corresponds to 360 degrees.
        let encStopPos = Math.abs(angle*487)/360; // Convert degree to 'wheel' millimeter.
        let dirA = MotorDirection.Forward;
        let dirB = MotorDirection.Reverse;
        if(angle < 0){ // Swap A and B direction.
            let temp = dirA;
            dirA = dirB;
            dirB = temp;
        }
        runCommand(encStopPos, dirA, dirB);
    }

    /**
     * Turn left by the specified amount 'angle' degree. If another command is already running the turn command is discarded.
     * @param angle in degree eg.: 90
     */
    //% subcategory=Steering
    //% weight=70
    //% blockId=cp_steering_turn_left
    //% block="turn left  %angle |degrees"
    export function turnLeft(angle: number):void {
        turnRight(-1*angle);
    }

    /**
     * Drive forward until a specified distance is reached. !Note! the distance must be in the range from 10cm to 100cm.
     * It is assumed that the distance is measured in forward direction.
     * The command will run until the measured distance is less than 'dist_cm' or the command is aborted.
     * If another command is already running the drive command is discarded.
     * @param dist_cm the distance to travel in centimeter eg.: 15
     * @param distancePin eg.: AnalogPin.P1
     */
    //% subcategory=Steering
    //% weight=67, blockGap=8
    //% blockId=cp_steering_forward_until
    //% block="drive forward until %dist_cm |cm from wall, measure at pin %distancePin"
    //% dist_cm.min=10 dist_cm.max=100
    export function forwardUntil(dist_cm: number, distancePin: AnalogPin):void {
        let currentDistance = convertAnalogToDistance_mm(pins.analogReadPin(distancePin));
        let dist_mm = Math.clamp(100, 1000, 10 * dist_cm); 
        if(currentDistance <= dist_mm || CommandRunning == true){
            return;
        }

        control.inBackground(() => {
            forward(10000); // Run forward in a 10 meters long time!!
        });

        basic.pause(DeltaT); // Wait until background task is up an running and CommandRunning is true.
        while (currentDistance > dist_mm && CommandRunning == true){

            currentDistance = convertAnalogToDistance_mm(pins.analogReadPin(distancePin));
            basic.pause(DeltaT);
        }
        
        abortCommand();
        basic.pause(3 * DeltaT); // To ensure command is completely aborted before we leave function.
    }

    function convertAnalogToDistance_mm(analogValue: number): number
    {
        return 10000000/(135 * analogValue - 4500);
    }
    
    /**
     * Follows a wall, by using the measured analog value as a distance measure.
     * It is assumed that the measured distance is perpendicular to the vehicle at either right or left side.
     * The command will run until the traveled distance is equal to 'travelDist' or the command is aborted.
     * If another command is already running the followWall command is discarded.
     * @param side eg.: Side.Left
     * @param travelDist_cm the distance to travel in centimeter eg.: 50
     * @param distancePin eg.: AnalogPin.P1
     */
    //% subcategory=Steering
    //% weight=65
    //% blockId=cp_steering_follow_wall
    //% block="follow %side | wall for %travelDist_cm | cm, measure at pin %distancePin"
    export function followWall(side: Side, travelDist_cm: number, distancePin: AnalogPin):void {
        if(travelDist_cm == 0 || CommandRunning == true){
            return;
        }
        CommandRunning = true;
        let setPoint = pins.analogReadPin(distancePin);
        resetEncoders();
        let done = false;
        while(done == false && CommandRunning== true){
            let distance = pins.analogReadPin(distancePin);
            let err = (setPoint - distance)/2; // Gain is 0.5
            if(side == Side.Left){
                err *= -1;
            }
            let powerA = Math.clamp(0, 100, 50 + err);
            let powerB = Math.clamp(0, 100, 50 - err);
            
            motorOn(Motors.MotorA, MotorDirection.Forward, powerA);
            motorOn(Motors.MotorB, MotorDirection.Forward, powerB);
            done = (((encoderAMillimeter() + encoderBMillimeter())/20) >= travelDist_cm);
            basic.pause(DeltaT);
        }
        // Stop the motors.
        motorOff(Motors.MotorA);
        motorOff(Motors.MotorB);
        CommandRunning = false;
    }

    /**
     * Abort any running steering command. 
     */
    //% subcategory=Steering
    //% weight=60
    //% blockId=cp_steering_abort_command
    //% block="abort steering command"
    export function abortCommand():void {
        CommandRunning = false;
    }

    /**
     * Return true if steering command is active otherwise false. 
     */
    //% subcategory=Steering
    //% weight=50
    //% blockId=cp_steering_command_running
    //% block="is steering command running"
    export function commandIsRunning(): boolean {
        return CommandRunning;
    }

    /**
     * Configure PID regulator used for steering.
     * @param _p the propotional gain eg.: 4
     * @param _i the integral gain eg.: 5
     * @param _d the differential gain eg.: 0
     */
    //% subcategory=Steering
    //% weight=40
    //% blockId=cp_steering_PID_configuration
    //% block="set PID controller P %_p| I %_i | D %_d" 
    export function SetPID_Controller(_p: number, _i: number, _d: number): void {
        P = _p;
        I = _i;
        D = _d;
    }

    function runCommand(encGoal_mm: number, dirA: MotorDirection, dirB: MotorDirection):void {
        if(encGoal_mm == 0 || CommandRunning == true){
            return;
        }

        CommandRunning = true;
        resetEncoders();
        let done = false;
        let pwmA = 512;
        let pwmB = 512;
        let prevErr = 0;
        let integralErr = 0;
        const integralLimit = 100;
        let maxPower = 1023;
        while(done == false && CommandRunning== true){
            let encA = encoderAMillimeter();
            let encB = encoderBMillimeter();
            
            // PID regulator.
            let err = (2 * encGoal_mm - (encA + encB))/ 2; // Error term.
            if(err < 0){
                integralErr = 0; // On overshoot - reset the integral error. (will never happen, since loop is exited)
            }			
            integralErr	= Math.clamp(integralLimit, integralLimit, integralErr + err);
            let avgPwm = P * err + I * integralErr + D * (prevErr - err);
            prevErr = err;
            
            // Hack - to make a ramp acceleration.
            if(err < 30 || err > (encGoal_mm - 30)){
                let dist = Math.min(err, encGoal_mm - err); // dist [0:30] millimeter
                maxPower = Math.clamp(0, 1023, 500 + dist * 20);
            } else {
                maxPower = 1023;
            }
            
            // If encA and encB differs we should be steering. (Use a P regulator for differential steering.)
            let diffErr = encA - encB;
            let diffPwm = P_diff * (diffErr);

            // Find resulting output signals.
            if(diffPwm > 0){
                pwmB = Math.clamp(0, maxPower, avgPwm + diffPwm); // encA > encB ~ pwmB should be larger.
                pwmA = Math.clamp(0, maxPower, pwmB - diffPwm);
            } else {
                pwmA = Math.clamp(0, maxPower, avgPwm - diffPwm); // encA < encB ~ pwmA should be larger
                pwmB = Math.clamp(0, maxPower, pwmA + diffPwm);
            }

            // Apply motor control signal.
            _motorOn(Motors.MotorA, dirA, pwmA);
            _motorOn(Motors.MotorB, dirB, pwmB);
            done = (encA >= encGoal_mm) && (encB >= encGoal_mm);
            basic.pause(DeltaT)
        }
        // Stop the motors.
        motorOff(Motors.MotorA);
        motorOff(Motors.MotorB);
        CommandRunning = false;
    }
}