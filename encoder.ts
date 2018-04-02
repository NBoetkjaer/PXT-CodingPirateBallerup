namespace CodingPirates {
	
	let encoderA = DigitalPin.P19;
	let encoderB = DigitalPin.P20;
	let counterA = 0;
	let counterB = 0;
	let totalCounterA = 0;
	let totalCounterB = 0;
	
	let encoderStarted = false;
	
	// Calibration of wheel differenses.
	let APulsesPerMeter = 464;
	let BPulsesPerMeter = 464;
	
	/**
     * Start listening for encoders pulses
     *
     */	 
    //% subcategory=Encoder
	//% weight=100
    //% blockId=cp_encoder_start
    //% block="Start encoder"	
    export function startEncoder(): void {
	
        if (encoderStarted) return;

        // Watch pin for a high or low pulse and increment counters accordingly.
        // Encoder A
		pins.onPulsed(encoderA, PulseValue.High, () => {
			counterA++;
			totalCounterA++;
        })
		pins.onPulsed(encoderA, PulseValue.Low, () => {
			counterA++;
			totalCounterA++
        })
		// Encoder B
		pins.onPulsed(encoderB, PulseValue.High, () => {
			counterB++;
			totalCounterB++;
        })
		pins.onPulsed(encoderB, PulseValue.Low, () => {
			counterB++;
			totalCounterB++;
        })
		
        // only init once
        encoderStarted = true;
    }
	

	/**
     * Return the counter value for encoder A.
     */
    //% subcategory=Encoder
	//% weight=90, blockGap=14
    //% blockId=cp_encoder_A_Count
    //% block="encoderA counter" 
    export function encoderACount(): number {
		return counterA;
	}
	
	/**
     * Return the traveled distance in millimeter for encoder A.
     */
    //% subcategory=Encoder
	//% weight=80
    //% blockId=cp_encoder_A_millimeter
    //% block="encoderA millimeter" 
    export function encoderAMillimeter(): number {
		return (counterA * 1000) / APulsesPerMeter ;
	}
	
	/**
     * Return the counter value for encoder B.
     */
    //% subcategory=Encoder
	//% weight=70, blockGap=14
    //% blockId=cp_encoder_B_Count
    //% block="encoderB counter" 
    export function encoderBCount(): number {
		return counterB;
	}
	
	/**
     * Return the traveled distance in millimeter for encoder B.
     */
    //% subcategory=Encoder
	//% weight=60
    //% blockId=cp_encoder_B_millimeter
    //% block="encoderB millimeter" 
    export function encoderBMillimeter(): number {
		return (counterB * 1000) / BPulsesPerMeter ;
	}
	
	/**
     * Reset the encoder counters A and B to zero.
     */
    //% subcategory=Encoder
	//% weight=50
    //% blockId=cp_encoder_reset
    //% block="reset encoders" 
    export function resetEncoders(): void {
		counterA = 0;
		counterB = 0;
		startEncoder();
	}
	
	/**
     * Configure which pins to use for the A and B encoders.
     * @param encA the digital pin used for encoder A eg: DigitalPin.P19
     * @param encB the digital pin used for encoder B eg: DigitalPin.P20
     */
    //% subcategory=Encoder
	//% weight=40
    //% blockId=cp_encoder_configuration
    //% block="Configure encoder pins A %encA| and B %encB" 
    export function encoderConfiguation(encA: DigitalPin, encB: DigitalPin): void {
		encoderA = encA;
		encoderB = encB;
	}
	
	/**
     * Calibrate encoders to measure distances.
     * @param encAPulses number of pulses per meter for encoder A eg: 464
     * @param encBPulses number of pulses per meter for encoder B eg: 464
     */
    //% subcategory=Encoder
	//% weight=30
    //% blockId=cp_encoder_calibration
    //% block="Calibrate encoders A %encAPulses| and B %encBPulses |pulses per meter" 
    export function encoderCalibration(encAPulses: number, encBPulses: number): void {
		APulsesPerMeter = encAPulses;
		BPulsesPerMeter = encBPulses;
	}	
}