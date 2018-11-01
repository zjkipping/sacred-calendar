import * as moment from 'moment';

import { Event, CalendarDate } from '@types';

export const UnitTestEvents: Event[] = [
  {
    'id': 55,
    'created': 1541086716,
    'name': 'Software Engineering Demo',
    'description': 'Giving a demo over our cool application we built.',
    'location': 'Strickland 204',
    'date': moment('2018-11-01T05:00:00.000Z', 'YYYY-MM-DD'),
    'startTime': '02:45 pm',
    'endTime': '03:00 pm',
    'category': {
      'id': 27,
      'name': 'Schoolasd',
      'color': '#dc1010'
    },
    'fontColor': 'white'
  },
  {
    'id': 57,
    'created': 1541087065,
    'name': 'Demo 1 Code/Documentation Submission',
    'description': 'Need to submit our demo-1 documentation into canvas + submit a link to our github for the code.',
    'location': undefined,
    'date': moment('2018-11-02T05:00:00.000Z', 'YYYY-MM-DD'),
    'startTime': '05:00 pm',
    'endTime': undefined,
    'category': {
      'id': 27,
      'name': 'Schoolasd',
      'color': '#dc1010'
    },
    'fontColor': 'white'
  },
  {
    'id': 58,
    'created': 1541087285,
    'name': 'Cajun Boil',
    'description': 'Second Annual Cajun Boil hosted by family and friends. \n\nNeed to bring food to add to pot!',
    'location': 'Lake St. Louis',
    'date': moment('2018-11-03T05:00:00.000Z', 'YYYY-MM-DD'),
    'startTime': '01:00 pm',
    'endTime': undefined,
    'category': {
      'id': 28,
      'name': 'Personal',
      'color': '#efbcf7'
    },
    'fontColor': 'black'
  },
  {
    'id': 59,
    'created': 1541087437,
    'name': 'Software Work',
    'description': 'Doing software work for my company, remotely.\n\n1 hour progress meeting during this time frame.',
    'location': undefined,
    'date': moment('2018-11-05T06:00:00.000Z', 'YYYY-MM-DD'),
    'startTime': '08:00 am',
    'endTime': '02:30 pm',
    'category': {
      'id': 28,
      'name': 'Personal',
      'color': '#efbcf7'
    },
    'fontColor': 'black'
  },
  {
    'id': 61,
    'created': 1541087532,
    'name': 'Finish Sacred Calendar for Demo 1',
    'description': 'Finish the functionality we want to have implemented by demo 1 for Software Engineering',
    'location': undefined,
    'date': moment('2018-10-31T05:00:00.000Z', 'YYYY-MM-DD'),
    'startTime': '12:00 am',
    'endTime': '12:00 pm',
    'category': {
      'id': 27,
      'name': 'Schoolasd',
      'color': '#dc1010'
    },
    'fontColor': 'white'
  },
  {
    'id': 62,
    'created': 1541088331,
    'name': 'Halloween Party',
    'description': undefined,
    'location': undefined,
    'date': moment('2018-10-31T05:00:00.000Z', 'YYYY-MM-DD'),
    'startTime': '08:00 pm',
    'endTime': '12:00 pm',
    'category': {
      'id': 28,
      'name': 'Personal',
      'color': '#efbcf7'
    },
    'fontColor': 'black'
  },
  {
    'id': 66,
    'created': 1541088907,
    'name': 'DE 2 Project Submission',
    'description': 'Need to submit my DE project about explosion effects to the class server.',
    'location': undefined,
    'date': moment('2018-11-02T05:00:00.000Z', 'YYYY-MM-DD'),
    'startTime': '11:59 pm',
    'endTime': undefined,
    'category': {
      'id': 27,
      'name': 'Schoolasd',
      'color': '#dc1010'
    },
    'fontColor': 'white'
  },
  {
    'id': 68,
    'created': 1541088989,
    'name': 'Computer Security Research Report',
    'description': 'Need to get some solid work done on this, so I\'m more free next week when it\'s due.',
    'location': undefined,
    'date': moment('2018-11-02T05:00:00.000Z', 'YYYY-MM-DD'),
    'startTime': '08:00 am',
    'endTime': '11:30 am',
    'category': {
      'id': 27,
      'name': 'Schoolasd',
      'color': '#dc1010'
    },
    'fontColor': 'white'
  },
  {
    'id': 71,
    'created': 1541089415,
    'name': 'Peace Studies Paper 2 Work',
    'description': 'Need to work on this rough draft since it is due next week. Primarily need to find resources and finish off the easier chunks of the paper (background info).',
    'location': undefined,
    'date': moment('2018-11-02T05:00:00.000Z', 'YYYY-MM-DD'),
    'startTime': '01:00 pm',
    'endTime': '04:00 pm',
    'category': {
      'id': 27,
      'name': 'Schoolasd',
      'color': '#dc1010'
    },
    'fontColor': 'white'
  },
  {
    'id': 79,
    'created': 1541090414,
    'name': 'Cook Dinner for next two nights',
    'description': undefined,
    'location': undefined,
    'date': moment('2018-11-02T05:00:00.000Z', 'YYYY-MM-DD'),
    'startTime': '06:00 pm',
    'endTime': '06:30 pm',
    'category': {
      'id': 28,
      'name': 'Personal',
      'color': '#efbcf7'
    },
    'fontColor': 'black'
  },
  {
    'id': 80,
    'created': 1541090625,
    'name': 'TigerAware Work',
    'description': 'Need to work on TigerAware V3 functionality and finish up a demo for tomorrow.',
    'location': undefined,
    'date': moment('2018-11-01T05:00:00.000Z', 'YYYY-MM-DD'),
    'startTime': '05:00 pm',
    'endTime': '08:00 pm',
    'category': {
      'id': 28,
      'name': 'Personal',
      'color': '#efbcf7'
    },
    'fontColor': 'black'
  },
  {
    'id': 89,
    'created': 1541101155,
    'name': 'Test Event',
    'description': 'asd asdasd asda sd',
    'location': 'Here',
    'date': moment('2018-11-08T06:00:00.000Z', 'YYYY-MM-DD'),
    'startTime': '04:20 am',
    'endTime': undefined,
    'category': {
      'id': 29,
      'name': 'Work',
      'color': '#0409b0'
    },
    'fontColor': 'white'
  }
];

export const UnitTestDates: any[] = [
  {
    'events': [],
    'mDate': moment('2018-10-28T05:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': true
  },
  {
    'events': [],
    'mDate': moment('2018-10-29T05:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': true
  },
  {
    'events': [],
    'mDate': moment('2018-10-30T05:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': true
  },
  {
    'events': [
      {
        'id': 61,
        'created': 1541087532,
        'name': 'Finish Sacred Calendar for Demo 1',
        'description': 'Finish the functionality we want to have implemented by demo 1 for Software Engineering',
        'location': undefined,
        'date': moment('2018-10-31T05:00:00.000Z', 'YYYY-MM-DD'),
        'startTime': '12:00 am',
        'endTime': '12:00 pm',
        'category': {
          'id': 27,
          'name': 'Schoolasd',
          'color': '#dc1010'
        },
        'fontColor': 'white'
      },
      {
        'id': 62,
        'created': 1541088331,
        'name': 'Halloween Party',
        'description': undefined,
        'location': undefined,
        'date': moment('2018-10-31T05:00:00.000Z', 'YYYY-MM-DD'),
        'startTime': '08:00 pm',
        'endTime': '12:00 pm',
        'category': {
          'id': 28,
          'name': 'Personal',
          'color': '#efbcf7'
        },
        'fontColor': 'black'
      }
    ],
    'mDate': moment('2018-10-31T05:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': true
  },
  {
    'events': [
      {
        'id': 55,
        'created': 1541086716,
        'name': 'Software Engineering Demo',
        'description': 'Giving a demo over our cool application we built.',
        'location': 'Strickland 204',
        'date': moment('2018-11-01T05:00:00.000Z', 'YYYY-MM-DD'),
        'startTime': '02:45 pm',
        'endTime': '03:00 pm',
        'category': {
          'id': 27,
          'name': 'Schoolasd',
          'color': '#dc1010'
        },
        'fontColor': 'white'
      },
      {
        'id': 80,
        'created': 1541090625,
        'name': 'TigerAware Work',
        'description': 'Need to work on TigerAware V3 functionality and finish up a demo for tomorrow.',
        'location': undefined,
        'date': moment('2018-11-01T05:00:00.000Z', 'YYYY-MM-DD'),
        'startTime': '05:00 pm',
        'endTime': '08:00 pm',
        'category': {
          'id': 28,
          'name': 'Personal',
          'color': '#efbcf7'
        },
        'fontColor': 'black'
      }
    ],
    'mDate': moment('2018-11-01T05:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': true,
    'disabled': false
  },
  {
    'events': [
      {
        'id': 68,
        'created': 1541088989,
        'name': 'Computer Security Research Report',
        'description': 'Need to get some solid work done on this, so I\'m more free next week when it\'s due.',
        'location': undefined,
        'date': moment('2018-11-02T05:00:00.000Z', 'YYYY-MM-DD'),
        'startTime': '08:00 am',
        'endTime': '11:30 am',
        'category': {
          'id': 27,
          'name': 'Schoolasd',
          'color': '#dc1010'
        },
        'fontColor': 'white'
      },
      {
        'id': 71,
        'created': 1541089415,
        'name': 'Peace Studies Paper 2 Work',
        'description': 'Need to work on this rough draft since it is due next week. Primarily need to find resources and finish off the easier chunks of the paper (background info).',
        'location': undefined,
        'date': moment('2018-11-02T05:00:00.000Z', 'YYYY-MM-DD'),
        'startTime': '01:00 pm',
        'endTime': '04:00 pm',
        'category': {
          'id': 27,
          'name': 'Schoolasd',
          'color': '#dc1010'
        },
        'fontColor': 'white'
      },
      {
        'id': 57,
        'created': 1541087065,
        'name': 'Demo 1 Code/Documentation Submission',
        'description': 'Need to submit our demo-1 documentation into canvas + submit a link to our github for the code.',
        'location': undefined,
        'date': moment('2018-11-02T05:00:00.000Z', 'YYYY-MM-DD'),
        'startTime': '05:00 pm',
        'endTime': undefined,
        'category': {
          'id': 27,
          'name': 'Schoolasd',
          'color': '#dc1010'
        },
        'fontColor': 'white'
      },
      {
        'id': 79,
        'created': 1541090414,
        'name': 'Cook Dinner for next two nights',
        'description': undefined,
        'location': undefined,
        'date': moment('2018-11-02T05:00:00.000Z', 'YYYY-MM-DD'),
        'startTime': '06:00 pm',
        'endTime': '06:30 pm',
        'category': {
          'id': 28,
          'name': 'Personal',
          'color': '#efbcf7'
        },
        'fontColor': 'black'
      },
      {
        'id': 66,
        'created': 1541088907,
        'name': 'DE 2 Project Submission',
        'description': 'Need to submit my DE project about explosion effects to the class server.',
        'location': undefined,
        'date': moment('2018-11-02T05:00:00.000Z', 'YYYY-MM-DD'),
        'startTime': '11:59 pm',
        'endTime': undefined,
        'category': {
          'id': 27,
          'name': 'Schoolasd',
          'color': '#dc1010'
        },
        'fontColor': 'white'
      }
    ],
    'mDate': moment('2018-11-02T05:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': false
  },
  {
    'events': [
      {
        'id': 58,
        'created': 1541087285,
        'name': 'Cajun Boil',
        'description': 'Second Annual Cajun Boil hosted by family and friends. \n\nNeed to bring food to add to pot!',
        'location': 'Lake St. Louis',
        'date': moment('2018-11-03T05:00:00.000Z', 'YYYY-MM-DD'),
        'startTime': '01:00 pm',
        'endTime': undefined,
        'category': {
          'id': 28,
          'name': 'Personal',
          'color': '#efbcf7'
        },
        'fontColor': 'black'
      }
    ],
    'mDate': moment('2018-11-03T05:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': false
  },
  {
    'events': [],
    'mDate': moment('2018-11-04T05:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': false
  },
  {
    'events': [
      {
        'id': 59,
        'created': 1541087437,
        'name': 'Software Work',
        'description': 'Doing software work for my company, remotely.\n\n1 hour progress meeting during this time frame.',
        'location': undefined,
        'date': moment('2018-11-05T06:00:00.000Z', 'YYYY-MM-DD'),
        'startTime': '08:00 am',
        'endTime': '02:30 pm',
        'category': {
          'id': 28,
          'name': 'Personal',
          'color': '#efbcf7'
        },
        'fontColor': 'black'
      }
    ],
    'mDate': moment('2018-11-05T06:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': false
  },
  {
    'events': [],
    'mDate': moment('2018-11-06T06:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': false
  },
  {
    'events': [],
    'mDate': moment('2018-11-07T06:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': false
  },
  {
    'events': [
      {
        'id': 89,
        'created': 1541101155,
        'name': 'Test Event',
        'description': 'asd asdasd asda sd',
        'location': 'Here',
        'date': moment('2018-11-08T06:00:00.000Z', 'YYYY-MM-DD'),
        'startTime': '04:20 am',
        'endTime': undefined,
        'category': {
          'id': 29,
          'name': 'Work',
          'color': '#0409b0'
        },
        'fontColor': 'white'
      }
    ],
    'mDate': moment('2018-11-08T06:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': false
  },
  {
    'events': [],
    'mDate': moment('2018-11-09T06:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': false
  },
  {
    'events': [],
    'mDate': moment('2018-11-10T06:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': false
  },
  {
    'events': [],
    'mDate': moment('2018-11-11T06:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': false
  },
  {
    'events': [],
    'mDate': moment('2018-11-12T06:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': false
  },
  {
    'events': [],
    'mDate': moment('2018-11-13T06:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': false
  },
  {
    'events': [],
    'mDate': moment('2018-11-14T06:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': false
  },
  {
    'events': [],
    'mDate': moment('2018-11-15T06:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': false
  },
  {
    'events': [],
    'mDate': moment('2018-11-16T06:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': false
  },
  {
    'events': [],
    'mDate': moment('2018-11-17T06:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': false
  },
  {
    'events': [],
    'mDate': moment('2018-11-18T06:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': false
  },
  {
    'events': [],
    'mDate': moment('2018-11-19T06:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': false
  },
  {
    'events': [],
    'mDate': moment('2018-11-20T06:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': false
  },
  {
    'events': [],
    'mDate': moment('2018-11-21T06:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': false
  },
  {
    'events': [],
    'mDate': moment('2018-11-22T06:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': false
  },
  {
    'events': [],
    'mDate': moment('2018-11-23T06:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': false
  },
  {
    'events': [],
    'mDate': moment('2018-11-24T06:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': false
  },
  {
    'events': [],
    'mDate': moment('2018-11-25T06:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': false
  },
  {
    'events': [],
    'mDate': moment('2018-11-26T06:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': false
  },
  {
    'events': [],
    'mDate': moment('2018-11-27T06:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': false
  },
  {
    'events': [],
    'mDate': moment('2018-11-28T06:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': false
  },
  {
    'events': [],
    'mDate': moment('2018-11-29T06:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': false
  },
  {
    'events': [],
    'mDate': moment('2018-11-30T06:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': false
  },
  {
    'events': [],
    'mDate': moment('2018-12-01T06:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': true
  },
  {
    'events': [],
    'mDate': moment('2018-12-02T06:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': true
  },
  {
    'events': [],
    'mDate': moment('2018-12-03T06:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': true
  },
  {
    'events': [],
    'mDate': moment('2018-12-04T06:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': true
  },
  {
    'events': [],
    'mDate': moment('2018-12-05T06:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': true
  },
  {
    'events': [],
    'mDate': moment('2018-12-06T06:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': true
  },
  {
    'events': [],
    'mDate': moment('2018-12-07T06:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': true
  },
  {
    'events': [],
    'mDate': moment('2018-12-08T06:00:00.000Z', 'YYYY-MM-DD'),
    'selected': false,
    'today': false,
    'disabled': true
  }
];
