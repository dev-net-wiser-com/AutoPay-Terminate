import React,{Component} from 'react';


export default  (title) => (WrappedComponent) => class Dialog extends Component{
    constructor(props) {

        super(props);

        this.state = {
            pageX: '50%',
            pageY: '80px',
            diffX: '',
            diffY: '',
            moving: false
           };

         this.getPosition = this.getPosition.bind(this)
         this.onMouseDown = this.onMouseDown.bind(this)
         this.onMouseUp = this.onMouseUp.bind(this)
         this.onMouseMove = this.onMouseMove.bind(this)
      }

      // 获取鼠标点击title时的坐标、title的坐标以及两者的位移
      getPosition (e) {
        const titleDom = e.target
        const X = titleDom.getBoundingClientRect().left;
        const Y = document.getElementsByClassName('group')[0].offsetTop;
        // 鼠标点击的坐标(页面)
        let mouseX = e.pageX
        let mouseY = e.screenY
        // 鼠标点击位置与modal的位移
        const diffX = mouseX - X
        const diffY = mouseY - Y
        return {X, Y, mouseX, mouseY, diffX, diffY}
      }
      /**
       * 鼠标按下，设置modal状态为可移动，并注册鼠标移动事件
       * 计算鼠标按下时，指针所在位置与modal位置以及两者的差值
       **/
      onMouseDown (e) {
        const position = this.getPosition(e)
        window.onmousemove = this.onMouseMove
        window.onmouseup = this.onMouseUp
        this.setState({moving: true, diffX: position.diffX, diffY: position.diffY})
      }

      // 松开鼠标，设置modal状态为不可移动
      onMouseUp (e) {
        const { moving } = this.state
        moving && this.setState({moving: false});
      }
      // 鼠标移动重新设置modal的位置
      onMouseMove (e) {
        const {moving, diffX, diffY} = this.state
        if (moving) {
          // 获取鼠标位置数据
          const position = this.getPosition(e)
          // 计算modal应该随鼠标移动到的坐标
          const x = position.mouseX - diffX
          const y = position.mouseY - diffY
          // 窗口大小
          const { clientWidth, clientHeight } = document.documentElement
          const modal = document.getElementsByClassName("group")[0]
          if (modal) {
            // 计算modal坐标的最大值,得出modal的最终位置
            const maxHeight = clientHeight - modal.offsetHeight
            const maxWidth = clientWidth - modal.offsetWidth
            const left = x > 0 ? (x < maxWidth ? x : maxWidth) : 0
            const top = y > 0 ? (y < maxHeight ? y : maxHeight) : 0
            this.setState({pageX: left, pageY: top})
          }
        }
      }
      hideModal = (event) =>{
          if(event){
            event.preventDefault();
          }
          //this.props.actions.changeValue("openEditModal",false);
          this.setState({
            pageX: '50%',
            pageY: '80px',
            diffX: '',
            diffY: '',
            moving: false
           });
      }

    render(){
        let {isOpen} = this.props;
        let { pageX, pageY, diffX, diffY } = this.state;
        return(
            isOpen ?
            <div className='dialog-con' >
                <div className='dialog-con-alert'>
                    <div className='dialog-con-alert-body group' style={{left: pageX,top: pageY}} >
                        <div className='modal-head' onMouseDown={this.onMouseDown}><h3>{this.props.title}</h3></div>
                        <WrappedComponent hideModal={this.hideModal} {...this.props}></WrappedComponent>
                    </div>
                </div>
            </div>
            :null
        )
    }
}
