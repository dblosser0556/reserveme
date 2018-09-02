import { MailerModule } from './mailer.module';

describe('MailerModule', () => {
  let mailerModule: MailerModule;

  beforeEach(() => {
    mailerModule = new MailerModule();
  });

  it('should create an instance', () => {
    expect(mailerModule).toBeTruthy();
  });
});
