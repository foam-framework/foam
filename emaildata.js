var emails = JSONUtil.mapToObj([
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:43:52 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Dinner! @ Mon Nov 19 7pm - 9pm (thafunkypresident@gmail.com)'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:43:18 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Croissants! @ Sun Nov 18, 2012 (thafunkypresident@gmail.com)',
      body: '\nThis is a reminder for:\n\nTitle: Croissants!\nWhen: Sun Nov 18, 2012\nCalendar: thafunkypresident@gmail.com\nWho:\n     * thafunkypresident@gmail.com - organizer\n\nEvent details:  \nhttps://www.google.com/calendar/event?action=VIEW&eid=dHNscWFxNzZtOWhlOG9u…ZTc2YTIwNmQyNjJiMjc0ZGI4YzEwMTg0MA&ctz=America/Chicago&hl=en\n\nInvitation from Google Calendar: https://www.google.com/calendar/\n\nYou are receiving this email at the account thafunkypresident@gmail.com  \nbecause you are subscribed for reminders on calendar  \nthafunkypresident@gmail.com.\n\nTo stop receiving these notifications, please log in to  \nhttps://www.google.com/calendar/ and change your notification settings for  \nthis calendar.\n'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:40:29 GMT-0500 (EST)'),
      from: '"Google+ team" <noreply-475ba29f@plus.google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: '6 people you might know on Google+',
      body: '\nHi Chuck\nHere\'s the week\'s top content.\n\nBrian Fitzpatrick\'s post:\n\n"\nI can\'t decide if this is a NYT restaurant review or an Onion article."\n'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:43:40 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Dinner! @ Mon Nov 12 7pm - 9pm (thafunkypresident@gmail.com)'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:42:24 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Dinner! @ Mon Nov 12 7pm - 9pm (thafunkypresident@gmail.com)'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:42:44 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Croissants! @ Sun Nov 11, 2012 (thafunkypresident@gmail.com)',
      body: '\nThis is a reminder for:\n\nTitle: Croissants!\nWhen: Sun Nov 11, 2012\nCalendar: thafunkypresident@gmail.com\nWho:\n     * thafunkypresident@gmail.com - organizer\n\nEvent details:  \nhttps://www.google.com/calendar/event?action=VIEW&eid=dHNscWFxNzZtOWhlOG9u…ODZiOWRlOTcxZjlkNjNkZWQ4MjAyNmE2Yw&ctz=America/Chicago&hl=en\n\nInvitation from Google Calendar: https://www.google.com/calendar/\n\nYou are receiving this email at the account thafunkypresident@gmail.com  \nbecause you are subscribed for reminders on calendar  \nthafunkypresident@gmail.com.\n\nTo stop receiving these notifications, please log in to  \nhttps://www.google.com/calendar/ and change your notification settings for  \nthis calendar.\n'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:44:03 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Croissants! @ Sun Nov 11, 2012 (thafunkypresident@gmail.com)',
      body: '\nThis is a reminder for:\n\nTitle: Croissants!\nWhen: Sun Nov 11, 2012\nCalendar: thafunkypresident@gmail.com\nWho:\n     * thafunkypresident@gmail.com - organizer\n\nEvent details:  \nhttps://www.google.com/calendar/event?action=VIEW&eid=dHNscWFxNzZtOWhlOG9u…ODZiOWRlOTcxZjlkNjNkZWQ4MjAyNmE2Yw&ctz=America/Chicago&hl=en\n\nInvitation from Google Calendar: https://www.google.com/calendar/\n\nYou are receiving this email at the account thafunkypresident@gmail.com  \nbecause you are subscribed for reminders on calendar  \nthafunkypresident@gmail.com.\n\nTo stop receiving these notifications, please log in to  \nhttps://www.google.com/calendar/ and change your notification settings for  \nthis calendar.\n'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:41:32 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Dinner! @ Mon Nov 5 7pm - 9pm (thafunkypresident@gmail.com)'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:43:32 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Dinner! @ Mon Nov 5 7pm - 9pm (thafunkypresident@gmail.com)'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:40:49 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Croissants! @ Sun Nov 4, 2012 (thafunkypresident@gmail.com)',
      body: '\nThis is a reminder for:\n\nTitle: Croissants!\nWhen: Sun Nov 4, 2012\nCalendar: thafunkypresident@gmail.com\nWho:\n     * thafunkypresident@gmail.com - organizer\n\nEvent details:  \nhttps://www.google.com/calendar/event?action=VIEW&eid=dHNscWFxNzZtOWhlOG9u…MGIzNmY0ZjZhNTE2M2MxNjZhOWUxMTA1Mg&ctz=America/Chicago&hl=en\n\nInvitation from Google Calendar: https://www.google.com/calendar/\n\nYou are receiving this email at the account thafunkypresident@gmail.com  \nbecause you are subscribed for reminders on calendar  \nthafunkypresident@gmail.com.\n\nTo stop receiving these notifications, please log in to  \nhttps://www.google.com/calendar/ and change your notification settings for  \nthis calendar.\n'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:42:50 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Croissants! @ Sun Nov 4, 2012 (thafunkypresident@gmail.com)',
      body: '\nThis is a reminder for:\n\nTitle: Croissants!\nWhen: Sun Nov 4, 2012\nCalendar: thafunkypresident@gmail.com\nWho:\n     * thafunkypresident@gmail.com - organizer\n\nEvent details:  \nhttps://www.google.com/calendar/event?action=VIEW&eid=dHNscWFxNzZtOWhlOG9u…MGIzNmY0ZjZhNTE2M2MxNjZhOWUxMTA1Mg&ctz=America/Chicago&hl=en\n\nInvitation from Google Calendar: https://www.google.com/calendar/\n\nYou are receiving this email at the account thafunkypresident@gmail.com  \nbecause you are subscribed for reminders on calendar  \nthafunkypresident@gmail.com.\n\nTo stop receiving these notifications, please log in to  \nhttps://www.google.com/calendar/ and change your notification settings for  \nthis calendar.\n'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:41:48 GMT-0500 (EST)'),
      from: '"Google+ team" <noreply-475ba29f@plus.google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: '6 people you might know on Google+',
      body: '\nHi Chuck\nHere\'s the week\'s top content.\n\nBrian Fitzpatrick\'s post:\n\n"This is beautiful.\n\nTibetan Sand Mandala 2012"\n'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:43:28 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Dinner! @ Mon Oct 29 7pm - 9pm (thafunkypresident@gmail.com)'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:45:30 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Dinner! @ Mon Oct 29 7pm - 9pm (thafunkypresident@gmail.com)'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:42:23 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Croissants! @ Sun Oct 28, 2012 (thafunkypresident@gmail.com)',
      body: '\nThis is a reminder for:\n\nTitle: Croissants!\nWhen: Sun Oct 28, 2012\nCalendar: thafunkypresident@gmail.com\nWho:\n     * thafunkypresident@gmail.com - organizer\n\nEvent details:  \nhttps://www.google.com/calendar/event?action=VIEW&eid=dHNscWFxNzZtOWhlOG9u…MWQ2MmEyNzE0NDM5MTZjZjQ5NTUyNmI0ZQ&ctz=America/Chicago&hl=en\n\nInvitation from Google Calendar: https://www.google.com/calendar/\n\nYou are receiving this email at the account thafunkypresident@gmail.com  \nbecause you are subscribed for reminders on calendar  \nthafunkypresident@gmail.com.\n\nTo stop receiving these notifications, please log in to  \nhttps://www.google.com/calendar/ and change your notification settings for  \nthis calendar.\n'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:42:56 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Croissants! @ Sun Oct 28, 2012 (thafunkypresident@gmail.com)',
      body: '\nThis is a reminder for:\n\nTitle: Croissants!\nWhen: Sun Oct 28, 2012\nCalendar: thafunkypresident@gmail.com\nWho:\n     * thafunkypresident@gmail.com - organizer\n\nEvent details:  \nhttps://www.google.com/calendar/event?action=VIEW&eid=dHNscWFxNzZtOWhlOG9u…MWQ2MmEyNzE0NDM5MTZjZjQ5NTUyNmI0ZQ&ctz=America/Chicago&hl=en\n\nInvitation from Google Calendar: https://www.google.com/calendar/\n\nYou are receiving this email at the account thafunkypresident@gmail.com  \nbecause you are subscribed for reminders on calendar  \nthafunkypresident@gmail.com.\n\nTo stop receiving these notifications, please log in to  \nhttps://www.google.com/calendar/ and change your notification settings for  \nthis calendar.\n'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:42:48 GMT-0500 (EST)'),
      from: '=?ISO-8859-1?Q?K=E1ri?= <no-reply@google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'You have been invited to contribute to Blah lah la Blog'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:41:50 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Dinner! @ Mon Oct 22 7pm - 9pm (thafunkypresident@gmail.com)'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:41:40 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Dinner! @ Mon Oct 22 7pm - 9pm (thafunkypresident@gmail.com)'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:44:27 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>',
      to: 'Chuck Finley <thafunkypresident@gmail.com>',
      subject: 'Reminder: Croissants! @ Sun Oct 21, 2012 (thafunkypresident@gmail.com)',
      body: '\nThis is a reminder for:\n\nTitle: Croissants!\nWhen: Sun Oct 21, 2012\nCalendar: thafunkypresident@gmail.com\nWho:\n     * thafunkypresident@gmail.com - organizer\n\nEvent details:  \nhttps://www.google.com/calendar/event?action=VIEW&eid=dHNscWFxNzZtOWhlOG9u…NGYzZDZkM2U5Yzg1N2Q0NTVlNjE0NzMzZQ&ctz=America/Chicago&hl=en\n\nInvitation from Google Calendar: https://www.google.com/calendar/\n\nYou are receiving this email at the account thafunkypresident@gmail.com  \nbecause you are subscribed for reminders on calendar  \nthafunkypresident@gmail.com.\n\nTo stop receiving these notifications, please log in to  \nhttps://www.google.com/calendar/ and change your notification settings for  \nthis calendar.\n'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:39:57 GMT-0500 (EST)'),
      from: '"Google+ team" <noreply-475ba29f@plus.google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'Top 3 posts for you on Google+ this week',
      body: '\nHi Chuck\nHere\'s the week\'s top content.\n\nBrian Fitzpatrick\'s post:\n\n"London to Brussels on the Eurostar. I love trains in Europe/ the UK."\n'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:40:48 GMT-0500 (EST)'),
      from: 'wmt-noreply@google.com',
      to: 'thafunkypresident@gmail.com',
      subject: 'Email notifications from Google Webmaster Tools'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:45:26 GMT-0500 (EST)'),
      from: '"Brian Willard (Google+)" <replyto-7b45ec87@plus.google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'July 10, 2012 (5 photos)',
      body: '\nBrian Willard shared Chuck Finley\'s post with you.\n\n"Just a test Re-share"\n\nChuck Finley\'s post:\n\nView the full post to comment:  \nhttps://plus.google.com/_/notifications/emlink?emrecipient=114004332105602…th=%2F109179780586379900038%2Fposts%2FYLTpH3WvJRQ&dt=1348587349800&ub=21\n'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:43:48 GMT-0500 (EST)'),
      from: '"Google+" <noreply-1670dad1@plus.google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'Brian Willard added you on Google+',
      body: '\nFollow and share with Brian by adding him to a circle.\n\nDon\'t know some of these people? You don\'t have to add them back (they\'ll  \njust see the stuff you share publicly). Learn more:  \nhttp://www.google.com/support/+/bin/answer.py?answer=1047805\n\nAdd to circles:  \nhttps://plus.google.com/_/notifications/emlink?emrecipient=114004332105602…6Vz7ICFfQiQAodCTkAAA&path=%2F109179780586379900038&dt=1348522386261&ub=1\n'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:45:14 GMT-0500 (EST)'),
      from: '"Google+ team" <noreply-475ba29f@plus.google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: '=?ISO-8859-1?Q?Brian_Fitzpatrick=2C_K=E1ri_Ragnarsson=2C_and_1_other_sha?=',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:40:26 GMT-0500 (EST)'),
      from: '"Google+ team" <noreply-475ba29f@plus.google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'Someone you might know on Google+',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:45:30 GMT-0500 (EST)'),
      from: 'noreply@google.com',
      to: 'thafunkypresident@gmail.com',
      subject: 'Ihr Google Datenexport-Archiv ist fertig.',
      labels:
      [
         'Personal',
         'Retention5'
      ],
      body: '\nIhr Google Datenexport-Archiv ist fertig und steht bis zum 02.07.2012 unter  \nhttps://takeout-qual.corp.google.com/takeout/#downloads zum Download  \nbereit. Vielen Dank, dass Sie Google Datenexport verwenden.\n'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:40:46 GMT-0500 (EST)'),
      from: 'Google Voice <voice-noreply@google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'Change to your Google Voice account',
      labels:
      [
         'Personal',
         'Retention5'
      ],
      body: '\nDear Chuck Finley,\nPlease note that the forwarding number (650) 390-3387 was deleted from your  \nGoogle Voice account (thafunkypresident@gmail.com) because it was claimed  \nand verified by another Google Voice user.\n\nIf you still want this forwarding number on your account and believe this  \nwas an error, please click here to learn more  \nhttp://www.google.com/support/voice/bin/answer.py?hl=en&answer=159519\n\n\nThanks,\nThe Google Voice Team\n'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:44:05 GMT-0500 (EST)'),
      from: 'Google Voice <voice-noreply@google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'New voicemail from (917) 359-5785 at 3:18 PM',
      labels:
      [
         'Retention5'
      ],
      body: '\nVoicemail from:  (917) 359-5785 at 3:18 PM\n\nTranscript: Hello my phone. Croaker you called about. This is one of your  \npotentially loyal subjects. 5. Yet.\n\nPlay message:  \nhttps://www.google.com/voice/fm/01922096794354635956/AHwOX_CLfmn2ncD3-ZgtW…fNYTzC00kjXgwaHgZ_AOR8rb-d0MGGFhqh1Be8BAqhkra5K_ghB3AkYkQObk6XprZ6zwrQ\n\n'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:43:41 GMT-0500 (EST)'),
      from: '"(917) 359-5785" <17736093865.19173595785.Tjz-mdw7-7@txt.voice.google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'SMS from (917) 359-5785',
      labels:
      [
         'Retention5'
      ],
      body: '\nWhat does the Funk want?\n'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:45:01 GMT-0500 (EST)'),
      from: '"(917) 359-5785" <17736093865.19173595785.Tjz-mdw7-7@txt.voice.google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'SMS from (917) 359-5785',
      labels:
      [
         'Retention5'
      ],
      body: 'Delivered-To: thafunkypresident@gmail.com\nReceived: by 10.68.35.65 with SMTP id f1csp54656pbj;\n        Wed, 13 Jun 2012 13:19:09 -0700 (PDT)\nReturn-Path: <3vPXYTyIUAI8KQQMPJSMRPO.KSKQMOSOQRO.m2I-5wFQ-QCGC.E71vx.z77z4x.v75@grandcentral.bounces.google.com>\nReceived-SPF: pass (google.com: domain of 3vPXYTyIUAI8KQQMPJSMRPO.KSKQMOSOQRO.m2I-5wFQ-QCGC.E71vx.z77z4x.v75@grandcentral.bounces.google.com designates 10.101.24.9 as permitted sender) client-ip=10.101.24.9;\nAuthentication-Results: mr.google.com; spf=pass (google.com: domain of 3vPXYTyIUAI8KQQMPJSMRPO.KSKQMOSOQRO.m2I-5wFQ-QCGC.E71vx.z77z4x.v75@grandcentral.bounces.google.com designates 10.101.24.9 as permitted sender) smtp.mail=3vPXYTyIUAI8KQQMPJSMRPO.KSKQMOSOQRO.m2I-5wFQ-QCGC.E71vx.z77z4x.v75@grandcentral.bounces.google.com; dkim=pass header.i=3vPXYTyIUAI8KQQMPJSMRPO.KSKQMOSOQRO.m2I-5wFQ-QCGC.E71vx.z77z4x.v75@grandcentral.bounces.google.com\nReceived: from mr.google.com ([10.101.24.9])\n        by 10.101.24.9 with SMTP id b9mr17492027anj.21.1339618748978 (num_hops = 1);\n        Wed, 13 Jun 2012 13:19:08 -0700 (PDT)\nDKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed;\n        d=google.com; s=20120113;\n        h=mime-version:references:message-id:date:subject:from:to\n         :content-type;\n        bh=e8HLQjYeNvE0cR9GZ2raX4Yc1yIZBK39ZbsKBJ6pbKQ=;\n        b=SQiXOUKD+ma2CMMweNomlWUDn0qyi2OiaPHlVhbLTiiqYoHzyTTgcOxz6cXo1QWToD\n         s06I98Qzs/ii9kX6rei0JH633JZL4jecnOpsrz00Rj/l+iX8FKSejitV6qsUS3H/G018\n         PeglfVm+EdKozPL9/3EaieNPE82xR3uxjqGEsU0+xuzzsN7DnByxsVkjrzpr5umqQutu\n         jcpyXWUHYJZwADWAF5RTjQt3qvt/SUbObO2D2D7uh+tpa8YBiioPLKPd+8+O5SXBbXyn\n         +8DXrWEFHmecAaKc8UkTD0ZlzKVF2A0iGGf6DHwLlPl1tVhW3DEZ7v+w1aYDMS/dF8Lz\n         uV+A==\nMIME-Version: 1.0\nReceived: by 10.101.24.9 with SMTP id b9mr13451230anj.21.1339618748957; Wed,\n 13 Jun 2012 13:19:08 -0700 (PDT)\nReferences: <+17736093865.ddcce90f1081fc291ec0893dd46b98785e3e81d8@txt.voice.google.com>\nMessage-ID: <+17736093865.ba3a999ba84d2e0be1c397a8ccd454b008ca6bbf@txt.voice.google.com>\n\n(A Hoy)Ahoy the funk!\n'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:43:07 GMT-0500 (EST)'),
      from: 'Google Voice <voice-noreply@google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'Welcome to Google Voice',
      labels:
      [
         'Retention5'
      ],
      body: 'Delivered-To: thafunkypresident@gmail.com\nReceived: by 10.68.35.65 with SMTP id f1csp53591pbj;\n        Wed, 13 Jun 2012 13:02:55 -0700 (PDT)\nReturn-Path: <37_HYTw0KEbo0tnhj-stwjuq3lttlqj.htrymfkzsp3uwjxnijsylrfnq.htr@grandcentral.bounces.google.com>\nReceived-SPF: pass (google.com: domain of 37_HYTw0KEbo0tnhj-stwjuq3lttlqj.htrymfkzsp3uwjxnijsylrfnq.htr@grandcentral.bounces.google.com designates 10.50.94.166 as permitted sender) client-ip=10.50.94.166;\nAuthentication-Results: mr.google.com; spf=pass (google.com: domain of 37_HYTw0KEbo0tnhj-stwjuq3lttlqj.htrymfkzsp3uwjxnijsylrfnq.htr@grandcentral.bounces.google.com designates 10.50.94.166 as permitted sender) smtp.mail=37_HYTw0KEbo0tnhj-stwjuq3lttlqj.htrymfkzsp3uwjxnijsylrfnq.htr@grandcentral.bounces.google.com; dkim=pass header.i=37_HYTw0KEbo0tnhj-stwjuq3lttlqj.htrymfkzsp3uwjxnijsylrfnq.htr@grandcentral.bounces.google.com\nReceived: from mr.google.com ([10.50.94.166])\n        by 10.50.94.166 with SMTP id dd6mr33953629igb.3.1339617775151 (num_hops = 1);\n        Wed, 13 Jun 2012 13:02:55 -0700 (PDT)\nDKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed;\n        d=google.com; s=20120113;\n        h=mime-version:message-id:date:subject:from:to:content-type;\n        bh=OXQsSN+XQp+qzjfrfqSjfXgOG2J2k7Iei+qBrPcEpM8=;\n        b=oKfOnjpaRh2MGhAUULs+ZPjaYTtI3AgwKxSnYqznJbWKq0mrOkmTM2T5XqtcNJ4mTJ\n         t0mZvhuU3BoP+G5ryZxF0pEoFB+vjKxfLUgzaoJV2UZVxpskJucRDthWhqMJo1cwAbM6\n         Y42coNhljxN5aYJVRPJp4fCq8wqZyCGeydLUzB2C2jD8tPnyX1td/4jAk9FJ1LaSslUO\n         Fu+1qv/KHf9/WFuvhI/fFHtthgia+v5TlhOscQQdrtTqMN4cl6jhPGeRDB7lyQyI5VZy\n         +nXpSehFSo5DoDfcBq/tF4XWx4v6wSJwzF5d5FzKRmUCt27zWn7WVEiTBir29r37uDP3\n         87aA==\nMIME-Version: 1.0\nReceived: by 10.50.94.166 with SMTP id dd6mr21311554igb.3.1339617775138; Wed,\n 13 Jun 2012 13:02:55 -0700 (PDT)\nMessage-ID: <e89a8f2354859f367104c260115b@google.com>\nContent-Type: multipart/alternative; boundary=e89a8f2354859f366804c2601158\n\n\nHi there,\n\nThanks for signing up for Google Voice!  Your new Google number is (773)  \n609-3865.\nHere are some things you can do to get started with Google Voice:\n1. Read transcriptions of voicemails.  \nhttp://www.youtube.com/watch?v=fHuai7-jVlY\n2. Customize which phones ring. http://www.youtube.com/watch?v=1KSoxdtyc58\n3. Personalize greetings for different callers.  \nhttp://www.youtube.com/watch?v=W1AHzu7CLkk\n4. Make cheap international calls.  \nhttp://www.youtube.com/watch?v=y6Zy-Ande6I\n5. Forward SMS to email. http://www.youtube.com/watch?v=Ka3T0RXwIbw\n6. Share voicemails with friends. http://www.youtube.com/watch?v=LpX0wbNtkC4\n7. Block unwanted callers. http://www.youtube.com/watch?v=hZwtQNKdWzk\n8. Screen callers before answering.  \nhttp://www.youtube.com/watch?v=eF-7UTvwAXs\n9. Access the mobile app on your phone.  \nhttp://www.youtube.com/watch?v=YSk9szCUDqA\n10. Conference call with co-workers.  \nhttp://www.youtube.com/watch?v=QkNEntf6qdw\n\nYou can see all these videos at http://www.youtube.com/googlevoice .  And  \nfor the latest news, check out our blog  \nhttp://googlevoiceblog.blogspot.com/ .\n\n- The Google Voice Team\n'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:41:03 GMT-0500 (EST)'),
      from: 'Google Voice <voice-noreply@google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'Welcome to Google Voice',
      labels:
      [
         'Retention5'
      ],
      body: '\nHi there,\n\nThanks for signing up for Google Voice!  Your new Google number is (773)  \n609-3865.\nHere are some things you can do to get started with Google Voice:\n1. Read transcriptions of voicemails.  \nhttp://www.youtube.com/watch?v=fHuai7-jVlY\n2. Customize which phones ring. http://www.youtube.com/watch?v=1KSoxdtyc58\n3. Personalize greetings for different callers.  \nhttp://www.youtube.com/watch?v=W1AHzu7CLkk\n4. Make cheap international calls.  \nhttp://www.youtube.com/watch?v=y6Zy-Ande6I\n5. Forward SMS to email. http://www.youtube.com/watch?v=Ka3T0RXwIbw\n6. Share voicemails with friends. http://www.youtube.com/watch?v=LpX0wbNtkC4\n7. Block unwanted callers. http://www.youtube.com/watch?v=hZwtQNKdWzk\n8. Screen callers before answering.  \nhttp://www.youtube.com/watch?v=eF-7UTvwAXs\n9. Access the mobile app on your phone.  \nhttp://www.youtube.com/watch?v=YSk9szCUDqA\n10. Conference call with co-workers.  \nhttp://www.youtube.com/watch?v=QkNEntf6qdw\n\nYou can see all these videos at http://www.youtube.com/googlevoice .  And  \nfor the latest news, check out our blog  \nhttp://googlevoiceblog.blogspot.com/ .\n\n- The Google Voice Team\n'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:43:57 GMT-0500 (EST)'),
      from: 'JJ Lueck <jlueck@google.com>',
      to: 'JJ Lueck <jlueck@google.com>, thafunkypresident@gmail.com',
      subject: 'Sample video',
      labels:
      [
         'Retention5'
      ],
      body: '\n\n'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:41:00 GMT-0500 (EST)'),
      from: '=?ISO-8859-1?Q?K=E1ri_Ragnarsson_=28Google=2B=29?= <noreply-3467b12d@plus.google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: 'Re: One beautiful user experience',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:43:54 GMT-0500 (EST)'),
      from: '"Google+" <noreply-3467b12d@plus.google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: '=?ISO-8859-1?Q?K=E1ri_Ragnarsson_is_now_a_manager_of_the_Funky_presi?=',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:40:25 GMT-0500 (EST)'),
      from: '"Google+" <noreply-3467b12d@plus.google.com>',
      to: 'thafunkypresident@gmail.com',
      subject: '=?ISO-8859-1?Q?K=E1ri_Ragnarsson_is_now_a_manager_of_the_Presidentia?=',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:43:26 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>\n',
      to: 'Chuck Finley <thafunkypresident@gmail.com>\n',
      subject: 'Reminder: Noogler Takes Day off for Moving @ Fri Apr 27 9am - 10am (thafunkypresident@gmail.com)\n',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:41:05 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>\n',
      to: 'Chuck Finley <thafunkypresident@gmail.com>\n',
      subject: 'Reminder: Bring Your Keds to Work @ Thu Apr 26 9am - 10am (thafunkypresident@gmail.com)\n',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:41:05 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>\n',
      to: 'Chuck Finley <thafunkypresident@gmail.com>\n',
      subject: 'Reminder: Stand-Up Comedy @ Wed Apr 25 11am - 12pm (thafunkypresident@gmail.com)\n',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:43:48 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>\n',
      to: 'Chuck Finley <thafunkypresident@gmail.com>\n',
      subject: 'Reminder: Q1 2012 Board of NerfWarriors All Hands @ Tue Apr 24 2pm -\n',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:40:08 GMT-0500 (EST)'),
      from: '"Google+ team" <noreply-475ba29f@plus.google.com>\n',
      to: 'thafunkypresident@gmail.com\n',
      subject: '6 people you might know on Google+\n',
      labels:
      [
         'Retention5'
      ],
      body: '\nHi Chuck\n\nHere\'s the week\'s top content.\n\n\nSuggestions for you: 6\n\n\nView all suggestions:  \n\nhttps://plus.google.com/_/notifications/emlink?emrecipient=114004332105602…FeiqQAodjxcAAA&path=%2Fcircles%2Ffind&reexp=EXP_6&dt=1334763096942&src=1\n'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:45:47 GMT-0500 (EST)'),
      from: 'Google Wallet <wallet-noreply@google.com>\n',
      to: 'thafunkypresident@gmail.com\n',
      subject: '=?utf-8?q?Google_Wallet_special_offer_today=3A_=245_for_=2410_at_Starbuck?=\n',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:41:23 GMT-0500 (EST)'),
      from: '"Google+" <noreply-1670dad1@plus.google.com>\n',
      to: 'thafunkypresident@gmail.com\n',
      subject: '=?ISO-8859-1?Q?K=E1ri_Ragnarsson_and_Chuck_Finley_added_you_on_Googl?=\n',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:44:12 GMT-0500 (EST)'),
      from: '"Google+" <noreply-1670dad1@plus.google.com>\n',
      to: 'thafunkypresident@gmail.com\n',
      subject: '=?ISO-8859-1?Q?K=E1ri_Ragnarsson_and_Chuck_Finley_added_you_on_Googl?=\n',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:40:30 GMT-0500 (EST)'),
      from: '=?ISO-8859-1?Q?K=E1ri_Ragnarsson_=28Google=2B=29?= <noreply-3467b12d@plus.google.com>\n',
      to: 'thafunkypresident@gmail.com\n',
      subject: 'Re: I could really use a generously crafter bologna...\n',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:44:04 GMT-0500 (EST)'),
      from: '"Chuck Finley (Google+)" <noreply-138cdc6f@plus.google.com>\n',
      to: 'thafunkypresident@gmail.com\n',
      subject: 'Re: I could really use a generously crafter bologna...\n',
      labels:
      [
         'Retention5'
      ],
      body: '\nChuck Finley commented on your post.\n\n\n"Get back to work!"\n\n\nView the full post to comment:  \n\nhttps://plus.google.com/_/notifications/emlink?emrecipient=115339915056926…AAA&path=%2F115339915056926011577%2Fposts%2FD1KWzqD6RRN&dt=1332365330385\n'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:40:23 GMT-0500 (EST)'),
      from: '=?ISO-8859-1?Q?K=E1ri_Ragnarsson_=28Google=2B=29?= <noreply-3467b12d@plus.google.com>\n',
      to: 'thafunkypresident@gmail.com\n',
      subject: 'Re: If anyone is reading this, please bring me...\n',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:41:17 GMT-0500 (EST)'),
      from: '"Chuck Finley (Google+)" <noreply-138cdc6f@plus.google.com>\n',
      to: 'thafunkypresident@gmail.com\n',
      subject: 'Re: If anyone is reading this, please bring me...\n',
      labels:
      [
         'Retention5'
      ],
      body: '\nChuck Finley commented on your post.\n\n\n"Yup!"\n\n\nView the full post to comment:  \n\nhttps://plus.google.com/_/notifications/emlink?emrecipient=103411841840063…AAA&path=%2F103411841840063836139%2Fposts%2FC9i5VEt17EA&dt=1332365313886\n'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:41:03 GMT-0500 (EST)'),
      from: '"Google+ team" <noreply-daa26fef@plus.google.com>\n',
      to: 'thafunkypresident@gmail.com\n',
      subject: 'Getting started on Google+\n',
      labels:
      [
         'Retention5'
      ],
      body: '\nHey Chuck,Welcome to Google+ - we\'re glad you\'re here! Here\'s a video and  \n\nsome tips to help you get started:\n\n\n\n\nhttps://plus.google.com/_/notifications/emlink?emrecipient=114004332105602…3godMxYAAA&path=%2F%3Fpop%3Dwv%26hl%3Den&dt=1331913820156\n\n\n\n\nGetting started on Google+\n\nFind people you knowCircles are the heart of Google+ - they control who you  \n\nshare with and whose posts you see.  Find people you know, then drag and  \n\ndrop them into circles that match your real-world relationships.\n\n\nhttps://plus.google.com/_/notifications/emlink?emrecipient=114004332105602…l664CFZBU3godMxYAAA&path=%2Fcircles%2Ffind&dt=1331913820156&src=1\n\n\nSee what people are sharingNow that you\'ve added people to your circles,  \n\nvisit your stream to see what they\'re saying. When you find something you  \n\nlike, add a comment or click +1 to just say "cool!"\n\n\nhttps://plus.google.com/_/notifications/emlink?emrecipient=114004332105602…emid=CLid-9Dl664CFZBU3godMxYAAA&path=%2Fstream&dt=1331913820156\n\n\nShare somethingTo post for the first time, click "Share what\'s new" - you  \n\ncan include photos, videos, and links. Select the circles or people you  \n\nwant to share with, or choose "Public" so that anyone can see what you have  \n\nto say.\n\n\nhttps://plus.google.com/_/notifications/emlink?emrecipient=114004332105602…id-9Dl664CFZBU3godMxYAAA&path=%2Fstream&dt=1331913820156\n\n\n\n\nCongrats, you\'ve made it to the end of this epic email. If you\'re still  \n\nseeking answers, check out the Google+ Help Center.\n\n\nhttp://www.google.com/support/+/?hl=en\n\n\nEnjoy! - The Google+ Team\n\n\n\n\nChange what email Google+ sends you:  \n\nhttps://plus.google.com/_/notifications/emlink?emrecipient=114004332105602…emid=CLid-9Dl664CFZBU3godMxYAAA&path=%2Fsettings%2Fplus&dt=1331913820156\n'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:41:18 GMT-0500 (EST)'),
      from: 'Google Checkout <noreply@checkout.google.com>\n',
      to: 'thafunkypresident@gmail.com\n',
      subject: 'Rate your shopping experience with Google using Google Checkout\n',
      labels:
      [
         'Personal',
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:45:08 GMT-0500 (EST)'),
      from: 'Google Voice <voice-noreply@google.com>\n',
      to: 'thafunkypresident@gmail.com\n',
      subject: 'Welcome to Google Voice\n',
      labels:
      [
         'Personal',
         'Retention5'
      ],
      body: '\nHi there,\n\n\nThanks for signing up for Google Voice!  Your new Google number is (424)  \n\n253-5699.\n\nHere are some things you can do to get started with Google Voice:\n\n1. Read transcriptions of voicemails.  \n\nhttp://www.youtube.com/watch?v=fHuai7-jVlY\n\n2. Customize which phones ring. http://www.youtube.com/watch?v=1KSoxdtyc58\n\n3. Personalize greetings for different callers.  \n\nhttp://www.youtube.com/watch?v=W1AHzu7CLkk\n\n4. Make cheap international calls.  \n\nhttp://www.youtube.com/watch?v=y6Zy-Ande6I\n\n5. Forward SMS to email. http://www.youtube.com/watch?v=Ka3T0RXwIbw\n\n6. Share voicemails with friends. http://www.youtube.com/watch?v=LpX0wbNtkC4\n\n7. Block unwanted callers. http://www.youtube.com/watch?v=hZwtQNKdWzk\n\n8. Screen callers before answering.  \n\nhttp://www.youtube.com/watch?v=eF-7UTvwAXs\n\n9. Access the mobile app on your phone.  \n\nhttp://www.youtube.com/watch?v=YSk9szCUDqA\n\n10. Conference call with co-workers.  \n\nhttp://www.youtube.com/watch?v=QkNEntf6qdw\n\n\nYou can see all these videos at http://www.youtube.com/googlevoice .  And  \n\nfor the latest news, check out our blog  \n\nhttp://googlevoiceblog.blogspot.com/ .\n\n\n- The Google Voice Team\n'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:41:55 GMT-0500 (EST)'),
      from: 'Google <privacy-noreply@google.com>\n',
      to: 'thafunkypresident@gmail.com\n',
      subject: 'Changes to Google Privacy Policy and Terms of Service\n',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:43:45 GMT-0500 (EST)'),
      from: 'no-reply@google.com\n',
      to: 'thafunkypresident@gmail.com\n',
      subject: 'Upgrade to Google Paid Storage\n',
      labels:
      [
         'Retention5'
      ],
      body: '\nHi there,\n\n\nWe\'ve successfully processed your order for additional paid storage\n\nfrom Google. It may take up to 24 hours for the 20 GB of storage to\n\nappear in your account.\n\n\nIf you have trouble accessing your storage, please use our paid storage\n\ntroubleshooting steps. Visit our help center to get more information on\n\nthe paid storage refund policy.\n\n\n-The Google Storage Team\n'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:45:36 GMT-0500 (EST)'),
      from: 'Google Checkout <noreply@checkout.google.com>\n',
      to: 'thafunkypresident@gmail.com\n',
      subject: 'Order receipt from Google ($5.00)\n',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:43:15 GMT-0500 (EST)'),
      from: 'noreply@google.com\n',
      to: 'thafunkypresident@gmail.com\n',
      subject: 'Ihr Google Datenexport-Archiv ist fertig.\n',
      labels:
      [
         'Retention5'
      ],
      body: '\nIhr Google Datenexport-Archiv ist fertig und steht bis zum 27.12.2011 unter  \n\nhttps://takeout-dogfood.corp.google.com/takeout/#downloads zum Download  \n\nbereit. Vielen Dank, dass Sie Google Datenexport verwenden.\n'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:42:37 GMT-0500 (EST)'),
      from: 'Google Kalender <calendar-notification@google.com>\n',
      to: 'Chuck Finley <thafunkypresident@gmail.com>\n',
      subject: 'Erinnerung: Lunch break @ Di 20. Dez. 11:00 - 13:00 (thafunkypresident@gmail.com)\n',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:42:00 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>\n',
      to: 'Chuck Finley <thafunkypresident@gmail.com>\n',
      subject: 'Reminder: Lunch break @ Mon Dec 19 11am - 1pm (thafunkypresident@gmail.com)\n',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:43:34 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>\n',
      to: 'Chuck Finley <thafunkypresident@gmail.com>\n',
      subject: 'Reminder: Lunch break @ Sun Dec 18 11am - 1pm (thafunkypresident@gmail.com)\n',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:42:20 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>\n',
      to: 'Chuck Finley <thafunkypresident@gmail.com>\n',
      subject: 'Reminder: Lunch break @ Sat Dec 17 11am - 1pm (thafunkypresident@gmail.com)\n',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:43:40 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>\n',
      to: 'Chuck Finley <thafunkypresident@gmail.com>\n',
      subject: 'Reminder: Lunch break @ Fri Dec 16 11am - 1pm (thafunkypresident@gmail.com)\n',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:41:24 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>\n',
      to: 'Chuck Finley <thafunkypresident@gmail.com>\n',
      subject: 'Reminder: Breakfast at Macy\'s @ Tue Dec 13 6:30am - 7:50am (Takeout\n',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:41:07 GMT-0500 (EST)'),
      from: 'noreply@google.com\n',
      to: 'thafunkypresident@gmail.com\n',
      subject: 'Your Google Takeout archive is ready\n',
      labels:
      [
         'Retention5'
      ],
      body: '\nYour Google Takeout archive is ready -- please visit  \n\nhttps://namadako.chi.corp.google.com/#downloads to download it. It will be  \n\navailable for you to download at any time until around Dec 16, 2011. Thanks  \n\nfor using Google Takeout!\n'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:42:57 GMT-0500 (EST)'),
      from: 'nobody@google.com\n',
      to: 'thafunkypresident@gmail.com\n',
      subject: 'Your Google Takeout archive is ready\n',
      labels:
      [
         'Retention5'
      ],
      body: '\nYour Google Takeout archive is ready -- please visit  \n\nhttps://namadako.chi.corp.google.com/#downloads to download it. It will be  \n\navailable for you to download at any time until around Dec 15, 2011. Thanks  \n\nfor using Google Takeout!\n'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:45:37 GMT-0500 (EST)'),
      from: 'noreply@google.com\n',
      to: 'thafunkypresident@gmail.com\n',
      subject: 'Your Google Takeout archive is ready\n',
      labels:
      [
         'Retention5'
      ],
      body: '\nYour Google Takeout archive is ready -- please visit  \n\nhttps://namadako.chi.corp.google.com/#downloads to download it. It will be  \n\navailable for you to download at any time until around Dec 15, 2011. Thanks  \n\nfor using Google Takeout!\n'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:45:17 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>\n',
      to: 'Chuck Finley <thafunkypresident@gmail.com>\n',
      subject: 'Reminder: Breakfast at Macy\'s @ Tue Dec 6 6:30am - 7:50am (Takeout\n',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:42:07 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>\n',
      to: 'Chuck Finley <thafunkypresident@gmail.com>\n',
      subject: 'Reminder: Breakfast at Macy\'s @ Tue Dec 6 6:30am - 7:50am (Test calendar)\n',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:44:36 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>\n',
      to: 'Chuck Finley <thafunkypresident@gmail.com>\n',
      subject: 'Reminder: Breakfast at Macy\'s @ Tue Nov 29 6:30am - 7:50am (Test calendar)\n',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:40:56 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>\n',
      to: 'Chuck Finley <thafunkypresident@gmail.com>\n',
      subject: 'Reminder: Breakfast at Macy\'s @ Tue Nov 29 6:30am - 7:50am (Takeout\n',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:41:45 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>\n',
      to: 'Chuck Finley <thafunkypresident@gmail.com>\n',
      subject: 'Reminder: Breakfast at Macy\'s @ Tue Nov 22 6:30am - 7:50am (Test calendar)\n',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:39:59 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>\n',
      to: 'Chuck Finley <thafunkypresident@gmail.com>\n',
      subject: 'Reminder: Breakfast at Macy\'s @ Tue Nov 22 6:30am - 7:50am (Takeout\n',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:43:30 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>\n',
      to: 'Chuck Finley <thafunkypresident@gmail.com>\n',
      subject: 'Reminder: Hair of the dog @ Fri Nov 11 9:30am - 10:30am (thafunkypresident@gmail.com)\n',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:40:11 GMT-0500 (EST)'),
      from: 'JJ Lueck <jlueck@google.com>\n',
      to: '"thafunkypresident@gmail.com" <thafunkypresident@gmail.com>\n',
      subject: 'Accepted: Test an event with organizers, attendees @ Thu Nov 10\n',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:41:54 GMT-0500 (EST)'),
      from: 'Nick Piepmeier <pieps@google.com>\n',
      to: '"thafunkypresident@gmail.com" <thafunkypresident@gmail.com>\n',
      subject: 'Accepted: Test an event with organizers, attendees @ Thu Nov 10\n',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:45:29 GMT-0500 (EST)'),
      from: 'Kari Ragnarsson <karir@google.com>\n',
      to: '"thafunkypresident@gmail.com" <thafunkypresident@gmail.com>\n',
      subject: 'Accepted: Test an event with organizers, attendees @ Thu Nov 10\n',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:41:36 GMT-0500 (EST)'),
      from: 'Google Calendar <calendar-notification@google.com>\n',
      to: 'Chuck Finley <thafunkypresident@gmail.com>\n',
      subject: 'Reminder: Liberate calendars @ Fri Nov 4 12pm - 1:50pm (Test calendar)\n',
      labels:
      [
         'Retention5'
      ]
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:44:26 GMT-0500 (EST)'),
      from: 'YouTube <no_reply@youtube.com>\n',
      to: 'thafunkypresident <thafunkypresident@gmail.com>\n',
      subject: '=?iso-8859-1?q?Invitation_to_earn_revenue_from_your_YouTube_videos_?=\n',
      labels:
      [
         'Retention5'
      ],
      body: 'MIME-Version: 1.0\n'
   },
   {
      model_: 'EMail',
      timestamp: new Date('Tue Dec 18 2012 11:42:11 GMT-0500 (EST)'),
      from: 'Nick Piepmeier <pieps@google.com>\n',
      to: 'Chuck Finley <thafunkypresident@gmail.com>\n',
      subject: 'Hey Chuck, can you help me out?\n',
      labels:
      [
         'Retention5'
      ],
      body: '\nI\'ve got a job for you. Call me.\n'
   }
]);
