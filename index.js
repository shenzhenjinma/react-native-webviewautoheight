
import React, { Component } from 'react';
import {
    Text,
    WebView,
    ScrollView,
    PixelRatio,
    View,
    Platform,
    ActivityIndicator,
} from 'react-native';
import ImmutableComponent from 'react-immutable-component';

let thisWebView=null;

export default class WebViewAutoHeight  extends ImmutableComponent {
  constructor(e){
      super(e);
      this.state={
          defWebViewHeight:0,
      }
  }
    pxToDp(px) {
    //这个转换算法有问题
    //   if(Platform.OS==="ios")
    //     return px / PixelRatio.get();
      return px;
    }
    //解析h5调用的协议数据


    _onLoadEnd(){
        const script = `window.postMessage(document.body.scrollHeight)`;
        thisWebView && thisWebView.injectJavaScript(script);
    }
    _onMessage (e) {
        let valToInt= parseInt(e.nativeEvent.data);
        let defWebViewHeight=this.pxToDp(valToInt);
        if(defWebViewHeight != this.state.defWebViewHeight) this.setState({defWebViewHeight});
    }
    //注入html代码让h5调用
    _getInjectedJavaScript(){
        const patchPostMessageFunction = ()=> {
            let originalPostMessage = window.postMessage;
            let patchedPostMessage = (message, targetOrigin, transfer)=> {
                originalPostMessage(message, targetOrigin, transfer);
            };
            patchedPostMessage.toString =()=> {
                return String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage');
            };
            window.postMessage = patchedPostMessage;
            //兼容旧版本，注入旧版本的调用方式
            // if(Platform.OS==="ios"){
            //     reactNativeAction=patchedPostMessage;
            // }else{
            //     window.MyWebview={};
            //     window.MyWebview.uriToRN = patchedPostMessage;
            // }
        };
        return '(' + String(patchPostMessageFunction) + ')();';
    }
    renderLoadingView(){
        if(this.state.defWebViewHeight == 0){
            return (
                <View style={{ alignItems:"center"}}>
                    <ActivityIndicator
                        animating={true}
                        style={{height: 80,width:80, }}
                        size="large"
                    />
                </View>
            )
        }
    }
    renderAutoHeightWebView(){
        return(
            <View style={{ height: this.state.defWebViewHeight,}}>
                <WebView
                    ref={webview => thisWebView = webview}
                    injectedJavaScript={this._getInjectedJavaScript()}
                    onLoadEnd={this._onLoadEnd}
                    onMessage={this._onMessage.bind(this)}
                    scrollEnabled={false}
                    {...this.props}
                />
            </View>
        )
    }
    render() {
        return (
              <ScrollView>
                  {this.renderLoadingView()}
                  {this.renderAutoHeightWebView()}
              </ScrollView>
        );
    }
}
