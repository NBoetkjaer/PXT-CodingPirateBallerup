namespace CodingPirates {
	
	let CommandRunning = false;
	// PID Regulator variables.
	let P = 5;
	let I = 2;
	let D = 0;
	let LoopFrequency = 50; // Hz
	
	/**
     * Configure PID regulator used for steering.
     * @param _p the propotional gain eg.: 5
     * @param _i the integral gain eg.: 0
	 * @param _d the differential gain eg.: 2
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
		let encStopPos = Math.abs(distance * 474)/100; // Convert centimeters to encoder pulses.
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
		let encStopPos = Math.abs(angle); // Convert degree to encoder pulses.
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
	
	function runCommand(encGoal: number, dirA: MotorDirection, dirB: MotorDirection):void {
		if(encGoal == 0 || CommandRunning == true){
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
		while(done == false && CommandRunning== true){
			let encA = encoderACount();
			let encB = encoderBCount();
			
			// PID regulator.
			let err = (2 * encGoal - (encA + encB))/ 2; // Error term.
			if(err < 0){
				integralErr = 0; // On overshoot - reset the integral error.
			}
			
			integralErr	= Math.clamp(integralLimit, integralLimit, integralErr + err);
			let avgPwm = P * err + I * integralErr + D * (prevErr - err);
			prevErr = err;
			// If encA and encB differs we should be steering. (Use a P regulator for steering.)
			let diffPwm = P * (encA - encB);
			if(diffPwm > 0){
				pwmB = Math.clamp(0,1203, pwmA - diffPwm); // encA > encB ~ pwmB should be larger.
				pwmA = pwmB + diffPwm;
			} else {
				pwmA = Math.clamp(0,1203, pwmA + diffPwm); // encA < encB ~ pwmA should be larger
				pwmB = pwmA - diffPwm;
			}
				
			// Apply motor control signal.
			_motorOn(Motors.MotorA, dirA, pwmA);
			_motorOn(Motors.MotorB, dirB, pwmB);
			done = (encA > encGoal) && (encB > encGoal);
			basic.pause(20)
		}
		// Stop the motors.
		motorOff(Motors.MotorA);
		motorOff(Motors.MotorB);
		CommandRunning = false;
	}
}