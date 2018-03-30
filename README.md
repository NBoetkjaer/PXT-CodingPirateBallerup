# CodingPirates blocks for micro:bit

Blocks that support ...
This package is for the ...

## Motors

* turn around

```blocks
input.onButtonPressed(Button.A, () => {
    CodingPirates.motorOn(CodingPirates.Motors.Motor1, CodingPirates.MotorDirection.Forward, 100);
    CodingPirates.motorOn(CodingPirates.Motors.Motor2, CodingPirates.MotorDirection.Reverse, 100);
})
```

* go forward

```blocks
input.onButtonPressed(Button.B, () => {
    CodingPirates.motorOn(CodingPirates.Motors.Motor1, CodingPirates.MotorDirection.Reverse, 100);
    CodingPirates.motorOn(CodingPirates.Motors.Motor2, CodingPirates.MotorDirection.Forward, 100);
})
```

* stop both motors when pressing ``A+B``

```blocks
input.onButtonPressed(Button.AB, () => {
    CodingPirates.motorOff(CodingPirates.Motors.Motor1);
    CodingPirates.motorOff(CodingPirates.Motors.Motor2);
})
```

## License

MIT

## Supported targets

* for PXT/microbit
(The metadata above is needed for package search.)

