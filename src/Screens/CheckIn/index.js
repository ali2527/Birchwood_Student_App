import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import React, {useState} from 'react';
import {styles} from './style';
import ContainerComponent from '../../Components/ContainerComponent';
import ScreenWrapperContainer from '../../Components/ScreenWrapperContainer';
import VectorIcon from '../../Components/VectorIcons';
import {colors} from '../../theme/colors';
import GlroyBold from '../../Components/GlroyBoldText';
import GrayMediumText from '../../Components/GrayMediumText';
import UserProfileCircle from '../../Components/ProfileCircle';
import dp1 from '../../Assets/icons/dp1.png';
import CustomTextInput from '../../Components/InputField';
import CustomButton from '../../Components/Button';

const CheckIn = () => {
  const data = [
    {
      id: '123',
      name: 'John Doe',
      class: 'Class 1',
      checkIn: '08:00 AM',
      checkOut: '01:00 PM',
    },
    {
      id: '1234',
      name: 'Jane Lee',
      class: 'Class 2',
      checkIn: '08:00 am',
      checkOut: '01:00 PM',
    },
    {
      id: '12345',
      name: 'John Smith',
      class: 'Class 3',
      checkIn: '08:00 am',
      checkOut: '01:00 PM',
    },
    {
      id: '123456',
      name: 'Bom Smith',
      class: 'Class 4',
      checkIn: '08:00 am',
      checkOut: '01:00 PM',
    },
  ];

  const reports = [
    {
      id: '123',
      title: 'Daily Report',
      description: 'View the daily attendance report',
    },
    {
      id: '1234',
      title: 'Weekly Report',
      description: 'View the weekly attendance report',
    },
    {
      id: '12345',
      title: 'Monthly Report',
      description: 'View the monthly attendance report',
    },
  ];

  const [formData, setFormData] = useState({
    name: '',
    class: '',
  });

  function handleChange(name, value) {
    setFormData({
      ...formData,
      [name]: value,
    });
  }

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

  const reportsCards = (items, indx) => {
    return (
      <View
        key={indx}
        style={[styles.reportCard, {marginTop: indx != 0 ? 20 : 5}]}>
        <View style={{flex: 1}}>
          <GrayMediumText
            text={items.title}
            _style={{
              color: colors.theme.black,
            }}
          />
          <GrayMediumText
            text={items.description}
            _style={{
              fontSize: 12,
            }}
          />
        </View>
        <CustomButton
          title={'View Report'}
          isFocused={true}
          containerStyle={{paddingHorizontal: 10, paddingVertical: 6}}
          _style={{fontSize: 10}}
        />
      </View>
    );
  };

  return (
    <ScreenWrapperContainer title="Check In">
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <View style={styles.container}>
          <View style={{alignItems: 'center'}}>
            <UserProfileCircle
              profileUri={dp1}
              disabled={true}
              _style={styles.dp}
            />
            <GlroyBold
              text={'Allien'}
              _style={{marginVertical: 8, color: colors.theme.black}}
            />
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <GrayMediumText text={'Class XI-B'} />
              <GrayMediumText
                text={'|'}
                _style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  marginHorizontal: 5,
                }}
              />
              <GrayMediumText text={'Roll no. 04'} />
            </View>
          </View>
          <View style={{margin: 10, marginHorizontal: 20}}>
            <CustomTextInput
              label="Student Name"
              name={'name'}
              onChangeText={(name, value) => handleChange(name, value)}
              placeholder={'Name'}
              value={formData.name}
              required
            />
            <CustomTextInput
              label="Class"
              name={'class'}
              onChangeText={(name, value) => handleChange(name, value)}
              placeholder={'Name'}
              value={formData.name}
              required
            />
          </View>
          <View style={{alignItems: 'center'}}>
            <CustomButton title={'Check In'} isFocused={true} />
            <TouchableOpacity>
              <GrayMediumText
                text={'Apply for sick leave'}
                _style={{color: colors.theme.primary, margin: 10}}
              />
            </TouchableOpacity>
          </View>
          <View style={{alignItems: 'center', margin: 5, marginTop: 10}}>
            <GrayMediumText
              text={'Attendance'}
              _style={{
                color: colors.theme.black,
              }}
            />
          </View>
          <View style={styles.attendanceTableContainer}>
            <View style={styles.tableHeading}>
              {['Student Name', 'Class', 'Check-in', 'Check-out'].map(
                (item, indx) => {
                  return (
                    <View
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        paddingVertical: 5,
                      }}
                      key={indx}>
                      <Text style={{fontSize: 14}}>{item}</Text>
                    </View>
                  );
                },
              )}
            </View>
            <View style={{margin: 1}} />
            {data.map((item, indx) => {
              return (
                <View
                  style={[
                    styles.tableItems,
                    {borderBottomWidth: data.length - 1 == indx ? 0 : 1},
                  ]}
                  key={indx}>
                  <GrayMediumText
                    text={item.name}
                    _style={styles.attendanceItem}
                  />
                  <GrayMediumText
                    text={item.class}
                    _style={styles.attendanceItem}
                  />
                  <GrayMediumText
                    text={item.checkIn}
                    _style={styles.attendanceItem}
                  />
                  <GrayMediumText
                    text={item.checkOut}
                    _style={styles.attendanceItem}
                  />
                </View>
              );
            })}
          </View>
          <View style={{alignItems: 'center', margin: 5, marginTop: 10}}>
            <GrayMediumText
              text={'Reports'}
              _style={{
                color: colors.theme.black,
              }}
            />
          </View>
          {reports.map((items, indx) => reportsCards(items, indx))}
          {/* <FlatList
            data={data}
            keyExtractor={item => `item_${item.id}`}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{margin: 10}} />}
            contentContainerStyle={styles.flatListContainer}
          /> */}
        </View>
      </ScrollView>
    </ScreenWrapperContainer>
  );
};

export default CheckIn;
