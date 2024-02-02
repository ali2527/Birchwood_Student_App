import React from 'react';
import {vectorIcons} from '../TemplateComponents/VectorIcons';

const VectorIcon = ({type, name, color, size, style}) => {
  // const { type, name, color, size, style } = props;
  const MyIcon = vectorIcons[type];
  return <MyIcon name={name} color={color} style={style} size={size} />;
};

export default VectorIcon;
