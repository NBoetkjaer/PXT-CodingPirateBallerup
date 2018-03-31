namespace CodingPirates {
	
	let encoderA = DigitalPin.P19;
	let encoderB = DigitalPin.P20;
	let counterA = 0;
	let counterB = 0;
	
	let encoderStarted = false;
	
	
	/**
     * Start listning to encoders 
     *
     */	 
    //% subcategory=Encoder
    //% blockId=cp_encoder_start
    //% block="Start encoder"	
    export function startEncoder(): void {
	
        if (encoderStarted) return;

        // Watch pin for a high or low pulse and increment counters accordingly.
        // Encoder A
		pins.onPulsed(encoderA, PulseValue.High, () => {
			counterA++;
        })
		pins.onPulsed(encoderA, PulseValue.Low, () => {
			counterA++;
        })
		// Encoder B
		pins.onPulsed(encoderB, PulseValue.High, () => {
			counterB++;
        })
		pins.onPulsed(encoderB, PulseValue.Low, () => {
			counterB++;
        })
		
        // only init once
        encoderStarted = true;
    }
	
	/**
     * Configure which pins to use for the A and B encoders.
     * @param encA the digital pin used for encoder A eg: DigitalPin.P19
     * @param encB the digital pin used for encoder B eg: DigitalPin.P20
     */
    //% subcategory=Encoder
    //% blockId=cp_encoder_configuration
    //% block="Configure encoder pins A %encA| and B %encB" 
    export function encoderConfiguation(encA: DigitalPin, encB: DigitalPin): void {
		encoderA = encA;
		encoderB = encB;
	}
	
	/**
     * Return the counter value for encoder A.
     */
    //% subcategory=Encoder
    //% blockId=cp_encoder_A_Count
    //% block="encoderA counter" 
    export function encoderACount(): number {
		return counterA;
	}
	
	/**
     * Return the counter value for encoder B.
     */
    //% subcategory=Encoder
    //% blockId=cp_encoder_B_Count
    //% block="encoderB counter" 
    export function encoderBCount(): number {
		return counterB;
	}
	
	/**
     * Reset the encoder counters A and B to zero.
     */
    //% subcategory=Encoder
    //% blockId=cp_encoder_reset
    //% block="reset encoders" 
    export function resetEncoders(): void {
		counterA = 0;
		counterB = 0;
		startEncoder();
	}
}