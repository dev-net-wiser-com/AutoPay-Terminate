import React, { Component } from 'react';
import './modal/dialog.scss';
 
class PageLoading extends Component{

  render(){
    let {isOpen} = this.props;
    return (
        isOpen?
        <div className='dialog-loading'>
            <div className="loading"><span></span><span></span><span></span><span></span><span></span></div>
            
        </div>
        :null
    );
  }
}
 
export default PageLoading;　　