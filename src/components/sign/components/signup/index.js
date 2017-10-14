import React, { Component } from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './style.scss'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { signin, signup } from '../../../../actions/sign'
import { fetchCountries } from '../../../../actions/countries'
import { getCountries } from '../../../../reducers/countries'

import Device from '../../../../common/device'

import CaptchaButton from '../../../captcha-button'

class SignUp extends Component {

  constructor(props) {
    super(props)
    this.submitSignup = this.submitSignup.bind(this)
    this.singupFailed = this.singupFailed.bind(this)
    this.sendCaptcha = this.sendCaptcha.bind(this)
  }

  componentWillMount() {
    const { countries, fetchCountries } = this.props
    if (countries.length == 0) fetchCountries({})
  }

  singupFailed(data) {

    this.refs['nickname-meg'].innerHTML = ''
    this.refs['email-meg'].innerHTML = ''
    this.refs['password-meg'].innerHTML = ''
    this.refs['gender-meg'].innerHTML = ''
    this.refs['captcha-meg'].innerHTML = ''

    for (let key in data) {
      let ref = this.refs[key+'-meg']
      if (ref) {
        ref.innerHTML = data[key] || ''
      }
    }

  }

  submitSignup(event) {

    event.preventDefault();

    let self = this

    let { nickname, areaCode, account, password, male, female, captcha } = this.refs

    const { signup, signin } = this.props

    if (!nickname.value) return nickname.focus()
    if (!account.value) return account.focus()
    if (!captcha.value) return captcha.focus()
    if (!password.value) return password.focus()
    if (!male.checked && !female.checked) return self.singupFailed({ gender: '请选择性别' })

    let data = {
      nickname: nickname.value,
      password: password.value,
      gender: male.checked ? 1 : 0,
      source: Device.getCurrentDeviceId(),
      captcha: captcha.value
    }

    if (account.value.indexOf('@') != -1) {
      data.email = account.value
    } else {
      data.phone = account.value
      data.area_code = areaCode.value
    }

    // 注册
    signup(data, function(err, result){
      if (err) {
        self.singupFailed(result.error);
      } else if (!err && result.success) {
        alert('注册成功')

        // 自动登录
        signin({
          email: account.value.indexOf('@') != -1 ? account.value : '',
          phone: account.value.indexOf('@') == -1 ? account.value : '',
          password: password.value
        }, function(err, result){
          setTimeout(()=>{
            location.reload()
          }, 100)
        });

      }
    });
  }

  sendCaptcha(callback) {
    const { areaCode, account } = this.refs

    if (!account.value) return account.focus()

    let params = { type: 'signup' }

    if (account.value.indexOf('@') != -1) {
      params.email = account.value
    } else {
      params.area_code = areaCode.value
      params.phone = account.value
    }

    callback(params)
  }

  render () {

    const { countries } = this.props

    return (
      <div styleName="signup">
        <div><input type="text" className="input" ref="nickname" placeholder="名字" /><div ref="nickname-meg"></div></div>
        <div>
          <div styleName="account-wrapper">
            <select ref="areaCode">
              {countries && countries.length > 0 && countries.map((item, index)=>{
                return (<option key={index} value={item.code}>{item.name} {item.code}</option>)
              })}
            </select>
            <input type="text" className="input" ref="account" placeholder="手机号" />
          </div>
          <div ref="email-meg"></div>
        </div>
        <div>
          <input type="text" className="input" placeholder="输入 6 位验证码" ref="captcha" />
          <span styleName="captcha-button"><CaptchaButton onClick={this.sendCaptcha} /></span>
          <div ref="captcha-meg"></div>
        </div>
        <div><input type="password" className="input" ref="password" placeholder="密码" /><div ref="password-meg"></div></div>
        <div styleName="gender">性别
          <input type="radio" name="gender" ref="male" />男
          <input type="radio" name="gender" ref="female" />女
          <div ref="gender-meg"></div>
        </div>
        <div><input type="submit" className="button" value="注册" onClick={this.submitSignup} /></div>

        <div styleName="signin">
          已经有账号了？ <a href="javascript:void(0)" onClick={()=>{this.props.displayComponent('signin')}}>登录</a>
        </div>
      </div>
    )
  }

}


SignUp.propTypes = {
  signup: PropTypes.func.isRequired,
  signin: PropTypes.func.isRequired,
  fetchCountries: PropTypes.func.isRequired,
  countries: PropTypes.array.isRequired
}

const mapStateToProps = (state) => {
  return {
    countries: getCountries(state)
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    signup: bindActionCreators(signup, dispatch),
    signin: bindActionCreators(signin, dispatch),
    fetchCountries: bindActionCreators(fetchCountries, dispatch)
  }
}

SignUp = CSSModules(SignUp, styles)

export default connect(mapStateToProps, mapDispatchToProps)(SignUp)
