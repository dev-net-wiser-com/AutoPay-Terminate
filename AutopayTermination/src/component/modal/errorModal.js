import React, { Component } from 'react';
import './dialog.scss';
import ReactTable from 'react-table';
import '../../style/react-comfirm-alert.css';
import { isEmpty,getDateType,stringToDate,checkHKIDcard,formatNum,moneyToNum} from '../../service/util';
import Dialog from './dialog';
import { confirmAlert } from 'react-confirm-alert';
import "react-datepicker/dist/react-datepicker.css";
import * as moment from 'moment';

class ErrorModal extends Component{
  constructor(props) {

    super(props);
  }

  hideModal = (event) =>{
      if(event){
        event.preventDefault();
      }
      this.props.actions.changeValue("openErrorModal",false);
      this.props.hideModal();  //弹出框位置还原

  }

  render(){
    let {info,actions} = this.props;
    let { errorList } = info;
    return (<div>
                    <div className="modal-body" style={{overflowY:"scroll"}}>
                        <div className="line-content">
                        <ReactTable
                          data={errorList}
                          noDataText=""
                          minRows={10}
                          className="-striped -highlight"
                          showPageJump={false}
                          showPageSizeOptions={false}
                          showPagination={false}
                          columns={[
                            {
                              Header: "Row No.",
                              accessor: "rowNo"
                            },{
                              Header: "Error Message",
                              accessor: "errorMsg"
                            }
                          ]}
                        ></ReactTable>
                        </div>
                    </div>


                    <div className="dialog-con-alert-button-group">
                        <button onClick={this.hideModal}>Return</button>
                    </div>
                </div>

    );
  }
}

export default Dialog("Error Log:")(ErrorModal);　　
