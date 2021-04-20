var loginAndRegister = new Vue({
  el: '#login-register-content',
  data: {
    loginUsername: '',
    loginPassword: '',
    loginErrors:[]
  },
  methods:{
    login:function(e){
      console.log(e);
    }
  }
})