namespace CodingPirates {
	
	let CommandRunning = false;
	// PID Regulator variables.
	let P = 4;
	let I = 5;
	let D = 0;
	// P Regulator for differential steering.
	let P_diff = 80;
	
	const LoopFrequency = 50; // Hz
	let DeltaT = 1000/LoopFrequency; // Control loop delay in milliseconds.	
	/**
     * Configure PID regulator used for steering.
     * @param _p the propotional gain eg.: 4
     * @param _i the integral gain eg.: 5
	 * @param _d the differential gain eg.: 0
     */
    //% subcategory=Steering
    //% blockId=cp_steering_PID_configuration
    //% block="Set PID controller P %_p| I %_i | D %_d" 
    export function SetPID_Controller(_p: number, _i: number, _d: number): void {
		P = _p;
		I = _i;
		D = _d;
	}
	/**
     * Drive forward by the specified amount. If another command is already running the forward command is discarded.
	 * @param distance distance to drive forward in centimeters eg.: 25
     */
    //% subcategory=Steering
    //% blockId=cp_steering_forward
    //% block="Drive forward %distance |centimeters"
    export function forward(distance: number):void {
		let encStopPos = Math.abs(distance * 10); // Convert centimeters to millimeter.
		let direction = MotorDirection.Forward;
		if(distance < 0){
			direction = MotorDirection.Reverse;
		}		
		runCommand(encStopPos, direction, direction);
	}
	
	/**
     * Drive backwards by the specified amount. If another command is already running the backward command is discarded.
	 * @param distance distance to drive backwards in centimeters eg.: 25
     */
    //% subcategory=Steering
    //% blockId=cp_steering_backward
    //% block="Drive backward %distance |centimeters"
    export function backward(distance: number):void {
		forward(-1*distance);
	}
	
	/**
     * Turn right by the specified amount 'angle' degree. If another command is already running the turn command is discarded.
	 * @param angle in degree eg.: 90
     */
    //% subcategory=Steering
    //% blockId=cp_steering_turn_right
    //% block="Turn right  %angle |degrees"
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
    //% blockId=cp_steering_turn_left
    //% block="Turn left  %angle |degrees"
    export function turnLeft(angle: number):void {
		turnRight(-1*angle);
	}	
	
	/**
     * Abort any running steering command. 
     */
    //% subcategory=Steering
    //% blockId=cp_steering_abort_command
    //% block="Abort steering command"
    export function abortCommand():void {
		CommandRunning = false;
	}
	
	/**
     * Return true if steering command is active otherwise false. 
     */
    //% subcategory=Steering
    //% blockId=cp_steering_command_running
    //% block="Is steering command running"
    export function commandIsRunning(): boolean {
		return CommandRunning;
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
				integralErr = 0; // On overshoot - reset the integral error.
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
			let diffErr = encA - encB 
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
			done = (encA > encGoal_mm) && (encB > encGoal_mm);
			basic.pause(DeltaT)
		}
		// Stop the motors.
		motorOff(Motors.MotorA);
		motorOff(Motors.MotorB);
		CommandRunning = false;
	}
}