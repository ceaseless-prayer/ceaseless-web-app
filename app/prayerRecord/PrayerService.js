'use strict';

angular.module('ceaselessLite')
  .factory('PrayerService', function (UserService, PrayerRecordModel) {
    return {
      prayed: function (member) {
        // create a prayer record
        var prayerRecord = {
          createDate: new Date(),
          links: {
            intercessor: UserService.auth.identities.intercessor.id,
            member: member.id
          }
        };

        var newPrayerRecord = new PrayerRecordModel(prayerRecord);
        newPrayerRecord.$save();
      }
    };
  });
