'use strict';
angular.module('ceaselessLite')
.controller('MemberDetailCtrl', function ($scope, $modalInstance, member, MemberModel, NoteModel, UserService, PrayerService, WebcamService) {
  $scope.editing = false;

  $scope.member = member;
  $scope.editedMember = new MemberModel($scope.member);

  $scope.edit = function() {
    $scope.editing = true;
  };

  $scope.close = function () {
    $modalInstance.close({
      'action': 'close',
      'member': $scope.member
    });
  };

  $scope.save = function () {
    _.assign($scope.member, $scope.editedMember);

    $scope.editedMember.$update({}, function() {
      $scope.success = true;
    }, function (httpResponse) {
      $scope.error = true;
    });
    $scope.editing = false;
  };

  $scope.confirmDeletion = false;
  $scope.delete = function () {
    $scope.editedMember.$delete();
    $modalInstance.close({
      'action': 'delete',
      'member': $scope.member
    });
  };
  var notes = NoteModel.get({member: $scope.member.id}, function () {
    $scope.notes = notes.notes.reverse();
  });

  // initialize model for new note
  $scope.newNote = {
    timestamp: null, // the server sets the timestamp.
    links: {
      author: UserService.auth.userId,
      member: member.id
    },
    content: ''
  };
  $scope.savingNote = false;
  $scope.addNote = function () {
    if(!_.isEmpty($scope.newNote.content)) {
      // save the note
      $scope.savingNote = true;
      var newNote = _.clone($scope.newNote, true);

      var createdNote = new NoteModel(newNote);
      createdNote.$save(function () {
        _.assign(newNote, createdNote.notes[0]);
        $scope.notes.unshift(newNote);
        $scope.savingNote = false;
      });

      // save the last note on the member
      // Note: this is not transactional, but the cost of inconsistency is low.
      $scope.editedMember.lastNote = newNote.content;
      $scope.editedMember.lastNoteDate = new Date();
      $scope.save();

      $scope.newNote.content = '';
    }
  };

  $scope.deleteNote = function (id) {
    var noteToDelete = new NoteModel({id:id});
    noteToDelete.$delete();
    var indexToUpdate = _.findIndex($scope.notes, function (i) {
      return i.id === id;
    });
    $scope.notes.splice(indexToUpdate, 1);

    // update the last note on the member
    // Note: this is not transactional, but the cost of inconsistency is low.
    if(_.isEmpty($scope.notes)) {
      $scope.editedMember.lastNote = null;
      $scope.editedMember.lastNoteDate = null;
    } else {
      $scope.editedMember.lastNote = $scope.notes[0].content;
      $scope.editedMember.lastNoteDate = $scope.notes[0].timestamp;
    }
    $scope.save();

  };

  $scope.prayed = PrayerService.prayed;

  WebcamService.init($scope);
});
