import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'unicode'
})
export class UnicodePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return decodeURIComponent(JSON.parse('"' + value.replace(/\"/g, '\\"') + '"'));
  }

}
