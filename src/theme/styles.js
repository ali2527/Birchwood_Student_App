import {vh, vw} from './units';

export const header = {
  authHeight: vh * 18,
};

export const spacing = {
  xsmall: vh * 0.5,
  small: vh * 1,
  medium: vh * 2,
  large: vh * 3,
  xlarge: vh * 4,
  xxlarge: vh * 6,

  xsmallh: vw * 0.5,
  smallh: vw * 1,
  mediumh: vw * 2,
  largeh: vw * 3,
  xlargeh: vw * 4,
};

export const font = {
  xxsmall: vh * 1.2,
  xsmall: vh * 1.4,
  small: vh * 1.6,
  medium: vh * 1.8,
  large: vh * 2,
  xlarge: vh * 2.25,
  xxlarge: vh * 3,
};

export const layout = {
  contentWidth: vw * 92,
  flex: {
    flex: 1,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  borderRadius: vh * 1.25,
};

export default {
  layout,
  spacing,
  font,
  header,
};
