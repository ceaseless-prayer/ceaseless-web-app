'use strict';

angular.module('ceaselessLite.i18n')
.config(['$translateProvider',
    function($translateProvider) {
  $translateProvider.translations('en', {
    /* Navigation Menu */
    'home': 'Home',
    'members': 'Members',
    'intercessors': 'Intercessors',
    'configuration': 'Configuration',
    'help': 'Help',
    'language': 'Language',
    'user profile': 'Profile',
    /* User */
    'sign in': 'Sign In',
    'email': 'E-mail',
    'could not create user': 'Sorry, we could not create your account',
    'submit' : 'Submit',
    'close' : 'Close',
    'login failed' : 'Sorry, we could not sign you in',
    'sign out': 'Sign Out',
    /* Membership */
    'add member': 'Add Member',
    'bulk upload members' : 'Bulk Upload Members (CSV)',
    'name': 'Name',
    'first name': 'First Name',
    'last name': 'Last Name',
    'phone': 'Phone Number',
    'facebook': 'Facebook',
    'address': 'Address',
    'gender': 'Gender',
    'note': 'Note',
    'invite': 'Invite',
    'profile picture': 'Profile Picture',
    'edit member': 'Edit Member',
    'details': 'Details',
    'prayed': 'Prayed',
    /* Intercessors */
    'add intercessor': 'Add Intercessor',
    'edit intercessor': 'Edit Intercessor',
    'description': 'Description',
    'active': 'Active',
    /* Home */
    'pray without ceasing' : '"Pray without ceasing"',
    'get a daily email with 3 friends to pray for': 'Get a daily e-mail with 3 people you care about to pray for.',
    /* Scripture */
    'OT_DAM_ID': 'ENGESVO2ET',
    'NT_DAM_ID': 'ENGESVN2ET'
  });

  $translateProvider.translations('id', {
    'home': 'Rumah',
    'members': 'Anggota',
    'intercessors': 'Orang Berdoa',
    'configuration': 'Configurasi',
    'help': 'Tolongan',
    'language': 'Bahasa (Language)',
    'sign in': 'Masuk',
    'add member': 'Menambahkan Anggota',
    /* Home */
    'pray without ceasing' : '"Pray without ceasing"',
    'get a daily email with 3 friends to pray for': 'Get a daily e-mail with 3 people you care about to pray for.'
  });

  $translateProvider.translations('cmn-traditional', {
    /* Navigation Menu */
    'home': '首頁',
    'members': '成員',
    'intercessors': '代禱者',
    'configuration': '設定',
    'help': '協助',
    'language': '語言 (Language)',
    /* User */
    'sign in': '登入',
    'email': '電子信箱',
    'could not create user': '道歉，我們無法設立您的賬戶',
    'submit' : '遞交',
    'close' : '關閉',
    'login failed' : '抱歉，我們暫時無法讓您登入',
    'sign out': '登出',
    /* Membership */
    'add member': '新增成員',
    'first name': '名',
    'last name': '姓',
    'gender': '性別',
    'note': '註記',
    'profile picture': '大頭貼',
    'edit member': '編輯成員',
    /* Intercessors */
    'add intercessor': '新增代禱者',
    'edit intercessor': '編輯代禱者',
    /* Home */
    'pray without ceasing' : '"不 住 的 禱 告"',
    'get a daily email with 3 friends to pray for': 'Get a daily e-mail with 3 people you care about to pray for.',
    'OT_DAM_ID': 'CHNUN1O2ET',
    'NT_DAM_ID': 'CHNUN1N2ET'
  });
  $translateProvider.storageKey('selectedLanguage');
  $translateProvider.useCookieStorage();
  $translateProvider.preferredLanguage('en');
}]);
