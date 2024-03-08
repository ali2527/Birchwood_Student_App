import {Text, View, FlatList, TouchableOpacity} from 'react-native';
import React from 'react';
import {styles} from './style';
import ContainerComponent from '../../Components/ContainerComponent';
import ScreenWrapperContainer from '../../Components/ScreenWrapperContainer';
import VectorIcon from '../../Components/VectorIcons';
import {colors} from '../../theme/colors';

const FeesDue = () => {
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
      <ScreenWrapperContainer title="Fees Due">
        <View style={styles.container}>
          <FlatList
            data={data}
            keyExtractor={item => `item_${item.id}`}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{margin: 10}} />}
            contentContainerStyle={styles.flatListContainer}
          />
        </View>
      </ScreenWrapperContainer>
    </ContainerComponent>
  );
};

export default FeesDue;
