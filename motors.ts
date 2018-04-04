namespace codingpirates {
	/************************************************************************************************************************************************
	* micro:bit motor driver blocks 
	************************************************************************************************************************************************/
		
	/*Default pins */
	let motorA1 = AnalogPin.P0;
	let motorA2 = DigitalPin.P16;
	
	let motorB1 = AnalogPin.P12;
	let motorB2 = DigitalPin.P8;
	
	let IsPwmPeriodInitialized = false;
	const PWM_Period = 1000; // 1000 usec ~ 1kHz

    /**
     * Enumeration of drive direction.
     */
	export enum MotorDirection {
        //% block="forward"
        Forward,
        //% block="reverse"
        Reverse
    }

	/**
	* Enumeration of motors.
	*/
    export enum Motors {
        //% blockId=cp_motordriver_motor_A
        //% block="motor A"
        MotorA,
        //% blockId=cp_motordriver_motor_B
        //% block="motor B"
        MotorB
    }

	/**
     * Turns on 'motor' in the direction specified
     * by 'dir', at the requested 'power' 
	 * @param motor which motor to turn on
	 * @param dir   which direction to go
	 * @param power how much power to send to the motor eg: 75
     */
    //% subcategory=MotorDriver
	//% weight=100
    //% blockId=cp_motordriver_motor_on
    //% block="run %motor|in direction %dir|with power %power"
    //% power.min=0 power.max=100
    export function motorOn(motor: Motors, dir: MotorDirection, power: number): void {
        /*Map 0-100 to 0-1023*/
        let pwmVal = (Math.clamp(0, 100, power) * 1023)/100;
		pwmVal = Math.clamp(0, 1023, pwmVal);
		_motorOn(motor, dir, pwmVal);
    }

	export function _motorOn(motor: Motors, dir: MotorDirection, pwmVal: number): void {
		if(!IsPwmPeriodInitialized)
		{	// Initialize PWM frequency of both motors.
			SetPwmPeriod(Motors.MotorA, PWM_Period);
			SetPwmPeriod(Motors.MotorB, PWM_Period);
			IsPwmPeriodInitialized = true;
		}
		pwmVal = Math.clamp(0, 1023, pwmVal);
		if(dir == MotorDirection.Reverse)
		{
			pwmVal = 1023 - pwmVal;
		}
        switch (motor) {
            case Motors.MotorA:
				pins.analogWritePin(motorA1, pwmVal);
				pins.digitalWritePin(motorA2, dir);
                break;
            case Motors.MotorB:
				pins.analogWritePin(motorB1, pwmVal);
				pins.digitalWritePin(motorB2, dir);
                break;
        }
    }

	/**
     * Turns off the motor specified by eMotors
     * @param motor :which motor to turn off
     */
    //% subcategory=MotorDriver
	//% weight=90
    //% blockId=cp_motordriver_motor_off
    //% block="turn off %motor"
    export function motorOff(motor: Motors): void {
        switch (motor) {
            case Motors.MotorA:
                pins.analogWritePin(motorA1, 0);
                pins.digitalWritePin(motorA2, 0);
                break;
            case Motors.MotorB:
                pins.analogWritePin(motorB1, 0);
                pins.digitalWritePin(motorB2, 0);
                break;
        }
    }
	
	/**
     * Configure which pins to use for the specified motor.
     * @param motor which motor to configure, eg: MotorA
     * @param pin1 the analog pin used for PWM, eg: AnalogPin.P0
     * @param pin2 the digital pin used for directions eg:DigitalPin.P16
     */
    //% subcategory=MotorDriver
	//% weight=80
    //% blockId=cp_motordriver_configuration
    //% block="configure %motor | pin1 %pin1 |pin2 %pin2" 
    export function motorConfiguation(motor: Motors, pin1: AnalogPin, pin2: DigitalPin): void {
        switch (motor) {
            case Motors.MotorA:
				motorA1 = pin1;
				motorA2 = pin2;
				break;
            case Motors.MotorB:
				motorB1 = pin1;
				motorB2 = pin2;
                break;
        }
    }
	
	function SetPwmPeriod(motor: Motors, pwmPeriod: number)
	{
		switch (motor) {
            case Motors.MotorA:
				pins.analogSetPeriod(motorA1, pwmPeriod); // 1KHz
				break;
            case Motors.MotorB:
				pins.analogSetPeriod(motorB1, pwmPeriod); // 1KHz
                break;
        }
	}
}