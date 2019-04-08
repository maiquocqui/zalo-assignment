import React, { Component } from 'react';
import { Paper, Typography, TextField, Fab, Button } from '@material-ui/core';
import Icon from '@material-ui/core/Icon';
import MomentUtils from '@date-io/moment';
import { MuiPickersUtilsProvider, DatePicker } from 'material-ui-pickers';
import moment from 'moment';
import 'moment/locale/vi';
import _ from 'lodash';
import axios from 'axios';

moment.locale('vi');

class Contact extends Component {
  constructor(props) {
    super(props);

    this.state = {
      success: false,
      selectedDate: null,
      fields: {
        name: '',
        phone: '',
        date: '',
        file: '',
        content: ''
      },
      errors: {},
      activeSubmit: false,
      img: {
        name: '',
        url: '',
        size: null,
        width: null,
        height: null
      }
    };
  }
  // load data
  componentDidMount() {
    axios.get(`http://localhost:3001/contactData`).then(res => {
      const contactData = res.data;
      this.setState({ contactData });
    });
  }
  // title case name
  titleCase(str) {
    str = str.toLowerCase().split(' ');
    let final = [];
    for (let word of str) {
      final.push(word.charAt(0).toUpperCase() + word.slice(1));
    }
    return final.join(' ');
  }
  // validate name
  validateName() {
    let fields = this.state.fields;
    let errors = this.state.errors;
    if (!fields['name']) {
      errors['name'] = 'Bạn chưa nhập họ tên';
    } else if (
      // regex tiếng việt version lầy lội
      !fields['name'].match(
        /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]+$/
      ) ||
      fields['name'].length < 3
    ) {
      errors['name'] = 'Họ tên dài tối thiểu 3 kí tự';
    } else {
      delete errors.name;
    }
    this.setState({ errors: errors });
  }
  // validate phone
  validatePhone() {
    let fields = this.state.fields;
    let errors = this.state.errors;
    if (!fields['phone']) {
      errors['phone'] = 'Bạn chưa nhập số điện thoại';
    } else if (!fields['phone'].match(/^[0]\d{9}$/)) {
      errors['phone'] = 'Số điện thoại bắt đầu bằng +84 hoặc 0';
    } else {
      delete errors.phone;
    }
    this.setState({ errors: errors });
  }
  // validate date
  validateDate() {
    let fields = this.state.fields;
    let errors = this.state.errors;
    if (!fields['date']) {
      errors['date'] = 'Bạn chưa nhập ngày sinh';
    } else {
      delete errors.date;
    }
    this.setState({ errors: errors });
  }
  // validate file
  validateFile(file) {
    // let fields = this.state.fields;
    let errors = this.state.errors;
    if (file) {
      let img = new Image();
      img.onload = () => {
        if (file.size / 1024 >= 2048 || img.width < 250 || img.height < 150) {
          errors['file'] =
            'Dung lượng file hình tối đa 2MB và kích thước tối thiểu là 250x150';
          this.setState({ errors: errors });
        } else {
          delete errors.file;
          let imgBase64;
          let FR = new FileReader();
          FR.onload = e => {
            imgBase64 = e.target.result;
            this.setState({
              fields: { ...this.state.fields, file: imgBase64 }
            });
          };
          FR.readAsDataURL(file);
        }
        if (
          _.isEmpty(errors) &&
          this.state.fields['name'] &&
          this.state.fields['phone'] &&
          this.state.fields['date'] &&
          this.state.fields['file'] &&
          this.state.fields['content']
        ) {
          this.setState({ activeSubmit: true });
        } else {
          this.setState({ activeSubmit: false });
        }
      };
      img.src = URL.createObjectURL(file);
    } else {
      errors['file'] = 'Bạn chưa nhập hình CMND';
      this.setState({ errors: errors });
    }
  }
  // validate content
  validateContent() {
    let fields = this.state.fields;
    let errors = this.state.errors;
    if (!fields['content']) {
      errors['content'] = 'Bạn chưa nhập nội dung';
    } else if (
      fields['content'].length < 10 ||
      fields['content'].length > 100
    ) {
      errors['content'] = 'Nội dung dài tối thiểu 10 ký tự và tối đa 100 ký tự';
    } else {
      delete errors.content;
    }
    this.setState({ errors: errors });
  }
  // function run when input change
  handleChangeDate(date) {
    let fields = this.state.fields;
    let errors = this.state.errors;
    new Promise((resolve, reject) => {
      this.setState({
        selectedDate: date
      });
      fields['date'] = moment(date).format('DD/MM/YYYY');
      // console.log(date);
      // console.log(fields['date']);
      this.setState({ fields: fields });
      resolve();
    }).then(() => {
      // console.log(this.state);
      if (
        _.isEmpty(errors) &&
        this.state.fields['name'] &&
        this.state.fields['phone'] &&
        this.state.fields['date'] &&
        this.state.fields['file'] &&
        this.state.fields['content']
      ) {
        this.setState({ activeSubmit: true });
      } else {
        this.setState({ activeSubmit: false });
      }
    });
  }
  handleChange(field, e) {
    let fields = this.state.fields;
    let errors = this.state.errors;
    // new update
    new Promise((resolve, reject) => {
      switch (field) {
        case 'name':
          fields[field] = this.titleCase(e.target.value);
          this.validateName();
          break;
        case 'phone':
          fields[field] = e.target.value;
          this.validatePhone();
          break;
        case 'file':
          let file = e.target.files[0];
          if (e.target.files[0]) {
            let img = new Image();
            img.onload = () => {
              this.setState({
                img: {
                  name: file.name,
                  url: img.src,
                  size: file.size,
                  width: img.width,
                  height: img.height
                }
              });
            };
            img.src = URL.createObjectURL(file);
          } else {
            this.setState({
              img: {
                name: '',
                url: '',
                size: '',
                width: '',
                height: ''
              }
            });
          }
          this.validateFile(e.target.files[0]);
          break;
        case 'content':
          fields[field] = e.target.value;
          this.validateContent();
          break;
        default:
          break;
      }
      this.setState({ fields });
      resolve();
    }).then(() => {
      // console.log(this.state);
      if (
        _.isEmpty(errors) &&
        this.state.fields['name'] &&
        this.state.fields['phone'] &&
        this.state.fields['date'] &&
        this.state.fields['file'] &&
        this.state.fields['content']
      ) {
        this.setState({ activeSubmit: true });
      } else {
        this.setState({ activeSubmit: false });
      }
    });
  }
  // submit function
  contactSubmit(e) {
    e.preventDefault();
    this.setState({ success: false });
    const requestParams = {
      name: this.state.fields.name,
      phone: this.state.fields.phone,
      date: this.state.fields.date,
      file: this.state.fields.file,
      content: this.state.fields.content
    };
    axios.post(`http://localhost:3001/contactData`, requestParams).then(res => {
      this.contactReset();
      this.setState({ success: true });
      // console.log(this.state);
    });
  }
  // reset function
  contactReset() {
    this.setState({
      success: false,
      selectedDate: null,
      fields: {
        name: '',
        phone: '',
        date: '',
        file: '',
        content: ''
      },
      errors: {},
      activeSubmit: false,
      img: {
        name: '',
        url: '',
        size: null,
        width: null,
        height: null
      }
    });
  }
  // render function
  render() {
    return (
      <Paper className="p-16 rounded-12 w-512 min-w-360">
        <Typography variant="h4" gutterBottom>
          Liên hệ
        </Typography>
        <form
          id="contactForm"
          name="contactform"
          className="flex flex-wrap -mx-8 mt-16"
          onSubmit={this.contactSubmit.bind(this)}
          onReset={this.contactReset.bind(this)}
        >
          <div className="w-full px-8 mb-8">
            <TextField
              className="w-full"
              type="text"
              variant="outlined"
              InputLabelProps={{
                shrink: true
              }}
              label="Họ và tên"
              ref="name"
              onChange={this.handleChange.bind(this, 'name')}
              value={this.state.fields['name']}
              error={this.state.errors['name'] ? true : false}
            />
            <p className="alert-text">{this.state.errors['name']}</p>
          </div>
          <div className="w-1/2 px-8 mb-8">
            <TextField
              className="w-full"
              type="text"
              variant="outlined"
              InputLabelProps={{
                shrink: true
              }}
              label="Số điện thoại"
              ref="phone"
              onChange={this.handleChange.bind(this, 'phone')}
              value={this.state.fields['phone']}
              error={this.state.errors['phone'] ? true : false}
            />
            <p className="alert-text">{this.state.errors['phone']}</p>
          </div>
          <div className="w-1/2 px-8 mb-8">
            <MuiPickersUtilsProvider
              utils={MomentUtils}
              locale="vi"
              moment={moment}
            >
              <DatePicker
                label="Ngày sinh"
                format="DD/MM/YYYY"
                InputLabelProps={{
                  shrink: true
                }}
                variant="outlined"
                className="w-full"
                ref="date"
                onChange={this.handleChangeDate.bind(this)}
                value={this.state.selectedDate}
                error={this.state.errors['date'] ? true : false}
              />
            </MuiPickersUtilsProvider>
            <p className="alert-text">{this.state.errors['date']}</p>
          </div>
          <div className="w-full px-8 mb-8">
            <TextField
              className="w-full"
              type="file"
              variant="outlined"
              InputLabelProps={{
                shrink: true
              }}
              inputProps={{ accept: 'image/png, image/jpeg' }}
              label="Chứng minh nhân dân"
              ref="file"
              onChange={this.handleChange.bind(this, 'file')}
              error={this.state.errors['file'] ? true : false}
            />
            {this.state.img.url && (
              <div className="preview-frame flex items-center mt-8">
                <div className="preview-img flex items-center justify-center">
                  <img
                    className=""
                    src={this.state.img.url}
                    alt="Hình preview"
                  />
                </div>
                <div className="preview-info">
                  <p>
                    File name: <strong>{this.state.img.name}</strong>
                  </p>
                  <p>
                    Dimensions: {this.state.img.width}px -{' '}
                    {this.state.img.height}px
                  </p>
                  <p>
                    Size:{' '}
                    {Math.round((this.state.img.size / 1024 / 1024) * 100) /
                      100}
                    MB
                  </p>
                </div>
              </div>
            )}
            <p className="alert-text">{this.state.errors['file']}</p>
          </div>
          <div className="w-full px-8 mb-8">
            <TextField
              className="w-full"
              type="text"
              variant="outlined"
              InputLabelProps={{
                shrink: true
              }}
              multiline
              rows={3}
              rowsMax={5}
              label="Nội dung"
              ref="content"
              onChange={this.handleChange.bind(this, 'content')}
              value={this.state.fields['content']}
              error={this.state.errors['content'] ? true : false}
            />
            <p className="alert-text">{this.state.errors['content']}</p>
          </div>
          {this.state.success && (
            <div className="w-full px-8 -mt-4 mb-20">
              <div className="alert-success flex">
                <Icon>check_circle</Icon>
                <p style={{ marginLeft: 12 }}>
                  Thông tin liên hệ đã được gửi thành công
                </p>
              </div>
            </div>
          )}
          <div className="w-full px-8">
            <div className="flex items-center">
              <Fab
                variant="extended"
                color="primary"
                id="submit"
                value="Submit"
                type="submit"
                disabled={!this.state.activeSubmit}
              >
                <Icon style={{ marginRight: 6 }}>send</Icon>
                Gửi thông tin
              </Fab>
              <Button
                className="ml-12"
                id="reset"
                value="Reset"
                type="reset"
                style={{ marginLeft: 12 }}
              >
                <Icon style={{ marginRight: 6 }}>settings_backup_restore</Icon>
                Hủy bỏ
              </Button>
            </div>
          </div>
        </form>
      </Paper>
    );
  }
}

export default Contact;
