import { Directive } from '@angular/core';
import { FormControl, NG_VALIDATORS } from '@angular/forms';

function multiEmailValidator(c: FormControl) {
  // tslint:disable-next-line:max-line-length
  // const regex = /[a-z0-9!#$%&'*+=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;
  // "/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/"
  const regex = /[a-z0-9\._%+!$&*=^|~#%'`?{}/\-]+@([a-z0-9\-]+\.){1,}([a-z]{2,16})/;
  console.log(c.value);

  // handle start up
  if (c.value === null) {
    return null;
  }

  // allow empty
  if (c.value === '') {
    return null;
  }

  if (c.value.indexOf(',') > -1) {
    const emailList = c.value.split(',');
    for (const email of emailList) {
      console.log('Email: ', email);
      console.log('Regex ', !regex.test(email));
      if (email === '' || !regex.test(email)) {
        console.log('return Invalid', email);
        return { 'multiEmailInvalid': { valid: false } };
      }
    }
    return null;
  } else {
    const email = c.value;
    if (!regex.test(email)) {
      return { 'multiEmailInvalid': { valid: false } };
    }
    return null;
  }

}
@Directive({
  selector: '[appMultiEmailValidator]',
  providers: [{
    provide: NG_VALIDATORS,
    useValue: multiEmailValidator,
    multi: true
  }]
})
// tslint:disable-next-line:directive-class-suffix
export class MultiEmailValidator {

  constructor() { }

}
