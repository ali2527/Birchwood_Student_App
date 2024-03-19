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

const Result = () => {
  const data = [
    {
      id: '123',
      receipt_no: '983344',
      month: 'October',
      payment_date: '10 Oct 20',
      pending_amount: '$999',
      status: 'pending',
    },
    {
      id: '1234',
      receipt_no: '983344',
      month: 'October',
      payment_date: '10 Oct 20',
      pay_mode: 'Cash on counter',
      total_amount: '$999',
      status: 'success',
    },
    {
      id: '12345',
      receipt_no: '983344',
      month: 'October',
      payment_date: '10 Oct 20',
      pay_mode: 'Cash on counter',
      total_amount: '$999',
      status: 'success',
    },
    {
      id: '123456',
      receipt_no: '983344',
      month: 'October',
      payment_date: '10 Oct 20',
      pay_mode: 'Cash on counter',
      total_amount: '$999',
      status: 'success',
    },
    {
      id: '1234567',
      receipt_no: '983344',
      month: 'October',
      payment_date: '10 Oct 20',
      pay_mode: 'Cash on counter',
      total_amount: '$999',
      status: 'success',
    },
  ];

  const renderItem = ({item}) => {
    return (
      <View style={styles.cardContainer}>
        <View style={{padding: 15}}>
          <View style={styles.itemContent}>
            <Text style={styles.titleText}>Receipt No.</Text>
            <Text style={{fontSize: 12}}>{item.receipt_no}</Text>
          </View>
          <View style={styles.borderLine} />
          <View style={styles.itemContent}>
            <Text style={styles.titleText}>Month</Text>
            <Text style={{fontSize: 12}}>{item.month}</Text>
          </View>
          <View style={styles.itemContent}>
            <Text style={styles.titleText}>Payment Date</Text>
            <Text style={{fontSize: 12}}>{item.payment_date}</Text>
          </View>
          {item.status === 'success' && (
            <View style={styles.itemContent}>
              <Text style={styles.titleText}>Pay Mode</Text>
              <Text style={{fontSize: 12}}>{item.pay_mode}</Text>
            </View>
          )}
          <View style={styles.borderLine} />
          <View style={styles.itemContent}>
            <Text style={styles.titleText}>
              {item.status === 'success'
                ? 'Total Amount'
                : 'Total Pending Amount'}
            </Text>
            <Text style={{fontSize: 12}}>
              {item.status === 'pending'
                ? item.pending_amount
                : item.total_amount}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.statusContainer}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: 'bold',
                marginHorizontal: 5,
                color: colors.theme.white,
              }}>
              {item.status === 'pending' ? 'Pay Now' : 'Download'}
            </Text>
            <VectorIcon
              type={'Ionicons'}
              name={
                item.status === 'pending'
                  ? 'arrow-forward-outline'
                  : 'cloud-download-outline'
              }
              size={15}
              color={colors.theme.white}
            />
          </View>
        </TouchableOpacity>
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
                    _style={{fontSize: 40, color: '#000'}}
                  />
                  <GlroyBold
                    text={'A+'}
                    _style={{
                      fontSize: 20,
                      marginLeft: 30,
                      bottom: 8,
                      color: '#000',
                    }}
                  />
                </ImageBackground>
              </View>
            </View>
          </ImageBackground>
        </GradientComponent>

        <View style={styles.childContainer}>
          <ScrollView contentContainerStyle={{flexGrow: 1}}>
            <Text>This is Result Screen</Text>
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
