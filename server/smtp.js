Meteor.startup(function () {
	//we put email_username:email_password@email_host:email_port/
	//Gmail SMTP port(TLS): 587, Gmail SMTP port(SSL): 465
	//Mailgun SMTP port(TLS): 587, Mailgun SMTP port(SSL): 465
	process.env.MAIL_URL = "smtp://postmaster@sandbox5401202abf09479f86d1752f674534e3.mailgun.org:b4790ad47b8754ffcaf61d5fde3a43eb@smtp.mailgun.org:587";
	//process.env.MAIL_URL="smtp://postmaster@sandbox579cbd077a884a74a6279666ef38982d.mailgun.org:d2a347a64fedcf29a274af2eb5d2278c@smtp.mailgun.org:587";
});

