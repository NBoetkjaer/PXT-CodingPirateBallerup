// go round
input.onButtonPressed(Button.A, () => {
    codingpirates.motorOn(codingpirates.Motors.MotorA, codingpirates.MotorDirection.Forward, 100);
    codingpirates.motorOn(codingpirates.Motors.MotorB, codingpirates.MotorDirection.Reverse, 100);
})
// go forward
input.onButtonPressed(Button.B, () => {
    codingpirates.motorOn(codingpirates.Motors.MotorA, codingpirates.MotorDirection.Reverse, 100);
    codingpirates.motorOn(codingpirates.Motors.MotorB, codingpirates.MotorDirection.Forward, 100);
})
// stop
input.onButtonPressed(Button.AB, () => {
    codingpirates.motorOff(codingpirates.Motors.MotorA);
    codingpirates.motorOff(codingpirates.Motors.MotorB);
})
