import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nextLine'
})
export class NextLinePipe implements PipeTransform {

  transform(text: any, splitBy: any): any {
    if (text) {
      return text.replace(/#/g, "<br />");
    } else {
      return text;
    }
  }

}
