import {Component, OnInit} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {RegistrationService} from '../shared/registration.service';
import {Router} from '@angular/router';


@Component({
  selector: 'app-registration-page',
  templateUrl: './registration-page.component.html',
  styleUrls: ['./registration-page.component.scss']
})
export class RegistrationPageComponent implements OnInit {

  form: FormGroup;
  submitted = false;

  constructor(
    public registrationService: RegistrationService,
    private router: Router,
  ) {
  }

  ngOnInit() {
    this.form = new FormGroup({
      email: new FormControl(null, Validators.required),
      password: new FormControl(null, Validators.required),
      confirmPassword: new FormControl(null, Validators.required),
      firstname: new FormControl(null, Validators.required),
      lastname: new FormControl(null, Validators.required),
      phone: new FormControl(null, Validators.required),
      gender: new FormControl(null, Validators.required),
      dateOfBirth: new FormControl(null, Validators.required),
      agree: new FormControl(null, Validators.required),
    });
  }

  submit() {
    console.log(this.form);
    if (this.form.invalid) {
      return;
    }

    this.submitted = true;

    const user = {
      email: this.form.value.email,
      password: this.form.value.password,
      confirmPassword: this.form.value.confirmPassword,
      firstname: this.form.value.firstname,
      lastname: this.form.value.lastname,
      phone: this.form.value.phone,
      gender: this.form.value.gender,
      dateOfBirth: new Date().toISOString().substring(0, 10),
      agree: this.form.value.agree,
      // dateOfBirth: new Date(this.form.value.dateOfBirth).toISOString().substring(0, 10),
    };
    this.registrationService.create(user).subscribe(res => {
        console.log(user);
        console.log(res);
        this.form.reset;
        this.router.navigate(['/', 'login']);
        this.submitted = false;


      },
      () => {
        this.submitted = false;
      }
    );

    // this.console.log(this.form);
  }

}
