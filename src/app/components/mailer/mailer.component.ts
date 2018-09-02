import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Email, ApiMessage } from '../../models';
import { MailerService } from '../../services';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-mailer',
  templateUrl: './mailer.component.html',
  styleUrls: ['./mailer.component.scss']
})
export class MailerComponent implements OnInit, OnChanges {
  @Input() toList: string;
  @Input() showEmailer: boolean;

  mailerForm: FormGroup;
  text;

  constructor(private fb: FormBuilder, private mailerService: MailerService,
    private toast: ToastrService) {
    this.showEmailer = false;
    this.createForm();
  }

  ngOnInit() {

  }

  ngOnChanges() {
    console.log('tolist', this.toList);
    this.mailerForm.reset(
      {
        from: 'dave@test.com',
        to: this.toList,
        cc: '',
        subject: '',
        body: ''
      });

  }

  submit() {
    this.mailerForm.updateValueAndValidity();
    if (this.mailerForm.invalid) {
      this.toast.error('The message needs attention make sure everything is filled out.',
        'Something Went Wrong');
      return;
    }
    const mail = this.getMailFromFormValue(this.mailerForm.value);
    // email requires the text and html text.


    this.mailerService.create(mail).subscribe(
      res => {
        const results: ApiMessage = res;
        if (results.success === true) {
          this.toast.success(results.message, 'Success');
          this.showEmailer = false;
        } else {
          this.toast.error(results.message, 'Something Went Wrong');
          console.log('Error', results);
        }
      }, error => {
        this.toast.error('Oops something went wrong', 'Error');
        console.log('Error ', error);
      }
    );

  }

  createForm() {
    this.mailerForm = this.fb.group({
      from: ['', { validator: [Validators.required, Validators.email] }],
      to: ['', { validator: [Validators.required, Validators.email] }],
      cc: ['', { validator: [Validators.email] }],
      subject: ['', Validators.required],
      body: ['', Validators.required]

    });
  }

  getMailFromFormValue(formValue: any): Email {

    const mail = {
      from: formValue.from,
      to: formValue.to,
      cc: formValue.cc,
      bcc: formValue.bcc,
      subject: formValue.subject,
      text: this.text,
      htmlText: formValue.body
    };
    return mail;
  }

  contentChanged($event: any) {
    this.text = $event.text;
  }

}
