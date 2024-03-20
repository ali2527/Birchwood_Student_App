import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Image,
  ScrollView,
} from 'react-native';
import React from 'react';
import {styles} from './style';
import ContainerComponent from '../../Components/ContainerComponent';
import ScreenWrapperContainer from '../../Components/ScreenWrapperContainer';
import VectorIcon from '../../Components/VectorIcons';
import {colors} from '../../theme/colors';
import {SecondaryHeader} from '../../Components/SecondaryHeader';
import GradientComponent from '../../Components/Gradient';
import {vh} from '../../theme/units';
import {resultScreenImgs} from '../../Assets';
import GlroyBold from '../../Components/GlroyBoldText';
import BottomLogo from '../../Components/BottomLogo';
import Button from '../../Components/Button';

const Result = () => {
  const data = [
    {
      id: '123',
      subject: 'English',
      total_numbers: '100',
      gain_number: '74',
      grade: 'B',
    },
    {
      id: '1234',
      subject: 'Art',
      total_numbers: '100',
      gain_number: '84',
      grade: 'B',
    },
    {
      id: '12345',
      subject: 'Science',
      total_numbers: '100',
      gain_number: '74',
      grade: 'B',
    },
    {
      id: '123456',
      subject: 'Math',
      total_numbers: '100',
      gain_number: '87',
      grade: 'B',
    },
    {
      id: '1234567',
      subject: 'Social Study',
      total_numbers: '100',
      gain_number: '89',
      grade: 'B',
    },
    {
      id: '12345678',
      subject: 'Drawing',
      total_numbers: '100',
      gain_number: '78',
      grade: 'B',
    },
    {
      id: '123456789',
      subject: 'Computer',
      total_numbers: '100',
      gain_number: '96',
      grade: 'A',
    },
  ];

  const renderItem = (item, indx) => {
    return (
      <View style={styles.cardContainer} key={indx}>
        <View
          style={{
            flex: 1,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}>
          <GlroyBold text={item.subject} _style={styles.titleText} />
        </View>
        <View
          style={{
            backgroundColor: colors.background.lightSky,
            alignItems: 'center',
            paddingHorizontal: 25,
            paddingVertical: 4,
          }}>
          <GlroyBold text={item.total_numbers} _style={styles.titleText} />
        </View>
        <View
          style={{
            backgroundColor: colors.background.dimWhite,
            alignItems: 'center',
            paddingHorizontal: 16.5,
            paddingVertical: 4,
            borderTopRightRadius: indx == 0 ? 10 : 0,
            borderBottomRightRadius: data.length == indx + 1 ? 10 : 0,
          }}>
          <GlroyBold
            text={`${item.gain_number} - ${item.grade}`}
            _style={styles.titleText}
          />
        </View>
      </View>
    );
  };

  return (
    <ContainerComponent>
      <View style={styles.container}>
        <GradientComponent style={{height: vh * 35}}>
          <ImageBackground
            source={resultScreenImgs.bg_img}
            style={styles.topBannerImg}>
            <View style={styles.gradeContainer}>
              <View style={styles.gradePercentImgContainer}>
                <ImageBackground
                  source={resultScreenImgs.grade}
                  style={styles.gradePercentImg}>
                  <GlroyBold
                    text={'83%'}
                    _style={{fontSize: 40, color: colors.text.black}}
                  />
                  <GlroyBold
                    text={'A+'}
                    _style={{
                      fontSize: 20,
                      marginLeft: 30,
                      bottom: 8,
                      color: colors.text.black,
                    }}
                  />
                </ImageBackground>
              </View>
            </View>
          </ImageBackground>
        </GradientComponent>

        <View style={styles.childContainer}>
          <ScrollView contentContainerStyle={{flexGrow: 1}}>
            <View style={{alignItems: 'center', marginTop: 10}}>
              <GlroyBold
                text={'You are Excellent,'}
                _style={{
                  fontSize: 17,
                  color: colors.text.black,
                }}
              />
              <GlroyBold
                text={'Jamie Allen !!'}
                _style={{fontSize: 25, color: colors.text.black}}
              />
              <View style={styles.resultTableContainer}>
                {data.map((item, indx) => renderItem(item, indx))}
              </View>
              <View style={{margin: 15}} />
              <Button title={'Download PDF'} isFocused={true} />
            </View>
          </ScrollView>
        </View>
        {/* <FlatList
            data={data}
            keyExtractor={item => `item_${item.id}`}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{margin: 10}} />}
            contentContainerStyle={styles.flatListContainer}
          /> */}
        <BottomLogo />
      </View>
    </ContainerComponent>
  );
};

export default Result;
