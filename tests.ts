// go round
input.onButtonPressed(Button.A, () => {
    CodingPirates.motorOn(CodingPirates.Motors.Motor1, CodingPirates.MotorDirection.Forward, 100);
    CodingPirates.motorOn(CodingPirates.Motors.Motor2, CodingPirates.MotorDirection.Reverse, 100);
})
// go forward
input.onButtonPressed(Button.B, () => {
    CodingPirates.motorOn(CodingPirates.Motors.Motor1, CodingPirates.MotorDirection.Reverse, 100);
    CodingPirates.motorOn(CodingPirates.Motors.Motor2, CodingPirates.MotorDirection.Forward, 100);
})
// stop
input.onButtonPressed(Button.AB, () => {
    CodingPirates.motorOff(CodingPirates.Motors.Motor1);
    CodingPirates.motorOff(CodingPirates.Motors.Motor2);
})
