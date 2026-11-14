import React from "react";
import {AbsoluteFill, CanvasImage, Composition, interpolate, staticFile, useCurrentFrame, useVideoConfig} from "remotion";

type BridgeProps = {title: string; subtitle: string};
export const BridgeSmoke: React.FC<BridgeProps> = ({title, subtitle}) => {
 const frame=useCurrentFrame(); const {fps}=useVideoConfig();
 return <AbsoluteFill style={{backgroundColor:"#071116",color:"#e5faff",fontFamily:"sans-serif"}}>
  <CanvasImage src={staticFile("blender/blender-demo.png")} premountFor={fps}
   style={{position:"absolute",left:0,top:65,width:960,height:720,
    scale:interpolate(frame,[0,3*fps],[1,1.04],{extrapolateRight:"clamp",output:"perceptual-scale"})}} />
  <div style={{position:"absolute",right:65,top:220,width:410,padding:30,backgroundColor:"#071116e8",border:"1px solid #72dff466",
   opacity:interpolate(frame,[0,.5*fps],[0,1],{extrapolateRight:"clamp"}),
   translate:interpolate(frame,[0,.5*fps],["0px 20px","0px 0px"],{extrapolateRight:"clamp"})}}>
   <div style={{fontSize:18,letterSpacing:4,color:"#72dff4",marginBottom:20}}>PIPELINE CHECK</div>
   <div style={{fontSize:58,fontWeight:700,lineHeight:1.1}}>{title}</div>
   <div style={{fontSize:24,lineHeight:1.5,marginTop:24,color:"#a5c7d0"}}>{subtitle}</div>
  </div>
  <div style={{position:"absolute",bottom:48,left:56,right:56,height:3,backgroundColor:"#72dff422"}}>
   <div style={{height:3,backgroundColor:"#72dff4",width:interpolate(frame,[0,3*fps],["0%","100%"],{extrapolateRight:"clamp"})}} />
  </div>
 </AbsoluteFill>;
};
export const MyComposition = () => <Composition id="BlenderBridgeSmoke" component={BridgeSmoke}
 durationInFrames={90} fps={30} width={1280} height={720}
 defaultProps={{title:"Blender + Remotion",subtitle:"3D modeling, lighting and rendering. Frame-accurate composition."}} />;
