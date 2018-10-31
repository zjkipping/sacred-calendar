import { Component } from '@angular/core';
import { DataService } from '@services/data.service';
import { Observable } from 'rxjs';

import { UserDetails } from '@types';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  user: Observable<UserDetails>;

  constructor(private dataService: DataService) {
    this.user = this.dataService.userDetails;
  }
}