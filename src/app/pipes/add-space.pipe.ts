import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'addSpace'
})
export class AddSpacePipe implements PipeTransform {

  transform(text: any): any {
    if (text) {
      return text.replace(/\W/gi, '').replace(/(.{4})/g, '$1 ');
    } else {
      return text;
    }
  }

}
