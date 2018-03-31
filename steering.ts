namespace CodingPirates {
	
	let commandRunning = false;
	/**
     * Drive forward by the specified amount. If another command is already running the forward command is discarded.
	 * @param distance distance to drive forward in centimeters eg.: 25
     */
    //% subcategory=Steering
    //% blockId=cp_steering_forward
    //% block="Drive forward %distance |centimeters"
    export function forward(distance: number):void {
		let encStopPos = Math.abs(distance);
		let direction = MotorDirection.Forward;
		if(distance == 0 || commandRunning == true){
			return;
		}
		if(distance < 0){
			direction = MotorDirection.Reverse;
		}

		let done = false;
		commandRunning = true;
		resetEncoders();

		while(done == false && commandRunning== true){
			let encA = encoderACount();
			let encB = encoderBCount();
			
			done = (encA > encStopPos) && (encB > encStopPos);
			motorOn(Motors.MotorA, direction, 100);
			motorOn(Motors.MotorB, direction, 100);
			basic.pause(20)
		}
		// Stop the motor.
		motorOff(Motors.MotorA);
		motorOff(Motors.MotorB);
		commandRunning = false;
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
     * Abort any running steering command. 
     */
    //% subcategory=Steering
    //% blockId=cp_steering_abort_command
    //% block="Abort steering command"
    export function abortCommand():void {
		commandRunning = false;
	}
}