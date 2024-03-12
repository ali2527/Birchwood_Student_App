import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import React, {useState} from 'react';
import {styles} from './style';
import ContainerComponent from '../../Components/ContainerComponent';
import ScreenWrapperContainer from '../../Components/ScreenWrapperContainer';
import VectorIcon from '../../Components/VectorIcons';
import {colors} from '../../theme/colors';
import {schoolGallery} from '../../Assets';
import EuclidCircularABold from '../../Components/wrappers/Texts/EuclidCircularABold';

export default function SchoolAlbums() {
  const [selectedDay, setSelectedDay] = useState('MON');
  const deviceWidth = Dimensions.get('window').width;

  const numColumns = deviceWidth < 600 ? 2 : 4;

  const data = [
    {
      id: '123',
      title: 'Friends',
      icon: schoolGallery.friends,
    },
    {
      id: '1234',
      title: 'Trip',
      icon: schoolGallery.trip,
    },
    {
      id: '12345',
      title: 'Family',
      icon: schoolGallery.family,
    },
    {
      id: '123456',
      title: 'Food',
      icon: schoolGallery.food,
    },
    {
      id: '1234567',
      title: 'Work',
      icon: schoolGallery.work,
    },
    {
      id: '12345678',
      title: 'Architecture',
      icon: schoolGallery.architecture,
    },
    {
      id: '123456789',
      title: 'My Cat',
      icon: schoolGallery.mycat,
    },
    {
      id: '12345678910',
      title: 'Band',
      icon: schoolGallery.band,
    },
    {
      id: '1234567891011',
      title: 'Concerts',
      icon: schoolGallery.concerts,
    },
    {
      id: '123456789101112',
      title: 'Trips',
      icon: schoolGallery.trips,
    },
    // {
    //   id: '12345678910111213',
    //   title: 'Friends',
    //   icon: schoolGallery.friends,
    // },
  ];

  const renderItem = ({item}) => {
    return (
      <TouchableOpacity style={[styles.cardContainer, styles.elevation]}>
        <Image source={item.icon} style={styles.cardImgStyle} />
      </TouchableOpacity>
    );
  };

  const onSelectDay = value => {
    setSelectedDay(value);
  };

  return (
    <ContainerComponent>
      <ScreenWrapperContainer title="Gallery">
        <View style={styles.container}>
          <View
            style={{
              alignItems: 'center',
              margin: 8,
            }}>
            <EuclidCircularABold
              text={'Albums'}
              style={{fontSize: 20, color: colors.theme.borderColor}}
            />
          </View>
          <FlatList
            data={data}
            keyExtractor={item => `item_${item.id}`}
            renderItem={renderItem}
            // ItemSeparatorComponent={() => <View style={{margin: 10}} />}
            contentContainerStyle={styles.flatListContainer}
            numColumns={numColumns}
          />
        </View>
      </ScreenWrapperContainer>
    </ContainerComponent>
  );
}
