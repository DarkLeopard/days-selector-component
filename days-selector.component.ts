import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
} from '@angular/forms';

@Component({
  selector: 'app-days-selector',
  templateUrl: './days-selector.component.html',
  styleUrls: [ './days-selector.component.scss' ],
})
export class DaysSelectorComponent implements OnInit, OnChanges {

  public week: FormGroup = new FormGroup({
    monday: new FormControl(false),
    tuesday: new FormControl(false),
    wednesday: new FormControl(false),
    thursday: new FormControl(false),
    friday: new FormControl(false),
    saturday: new FormControl(false),
    sunday: new FormControl(false),
  });

  public daysOfWeek: string[] = [ 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday' ];
  @Input() selectDays: number; // binary
  @Input() usedDays: number[]; // binary[]
  @Input() disabled: boolean = false;
  @Output() selectedDays: EventEmitter<number> = new EventEmitter<number>();

  constructor() { }

  private static parseToBinary(dec: number): string {
    if (dec === null) dec = 0;

    const arr: string[] = dec.toString(2).split('');

    while (arr.length < 7) {
      arr.unshift('0');
    }

    return arr.reverse().join('');
  }

  private static binaryToDec(bin: string): number {
    return parseInt(bin.split('').reverse().join(''), 2);
  }

  public ngOnInit(): void {}

  public ngOnChanges(changes: SimpleChanges): void {
    if ( changes.selectDays && changes.selectDays.currentValue !== changes.selectDays.previousValue ) {
      const values: boolean[] = DaysSelectorComponent
          .parseToBinary(this.selectDays)
          .split('')
          .map(value => value === '1');

      this.daysOfWeek.forEach((day, index) => {
        this.week.get(day).setValue(values[index]);
      });
    }

    const compareFn = (arr1: number[], arr2: number[]): boolean => {
      return arr1 === arr2 && arr1.map((value1) => arr2.some((value2) => value1 === value2)).every(value => value === true);
    };

    if (
        (changes.usedDays
        && changes.usedDays.currentValue
        && changes.usedDays.previousValue
        && !compareFn(changes.usedDays.currentValue, changes.usedDays.previousValue))
        || changes.usedDays.firstChange
    ) {
      const disableMask: string = DaysSelectorComponent
          // tslint:disable-next-line:no-bitwise
          .parseToBinary(this.usedDays.reduce((acc, d) => acc | d));

      this.daysOfWeek.forEach((day, index) => {
        if (disableMask[index] === '1' && this.week.get(day).value === false) this.week.get(day).disable();
        if (disableMask[index] === '0') this.week.get(day).enable();
      });
    }
  }

  public selectDay(selectedDay: string): void {
    const currentValue: boolean = this.week.get(selectedDay).value;
    this.week.get(selectedDay).setValue(!currentValue);
    this.emit();
  }

  private emit(): void {
    const formValue: { [key: string]: boolean } = this.week.getRawValue();

    const formValuesArr: boolean[] = [];
    for ( const key in formValue ) {
      if ( key ) formValuesArr.push(formValue[key]);
    }

    const binary: string = formValuesArr.map(value => value ? '1' : '0').join('');

    this.selectedDays.emit(DaysSelectorComponent.binaryToDec(binary));
  }

}
