/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import FoodItem from './src/components/FoodItem';
import { FlatList } from 'react-native-gesture-handler';

export interface IFoodItem {
  id: number;
  name: string;
  amount: string;
  quantity: number;
}

const FOOD_ITEMS: IFoodItem[] = [
  {
    id: 1,
    name: 'Chicken Fried Rice',
    amount: 'LKR 2,100.00',
    quantity: 2,
  },
  {
    id: 2,
    name: 'Devilled Chicken(Boneless)',
    amount: 'LKR 1,700.00',
    quantity: 1,
  },
  {
    id: 4,
    name: 'Milk Shake',
    amount: 'LKR 700.00',
    quantity: 4,
  },
];

function App() {

  const [allItems, setAllItems] = useState(FOOD_ITEMS);

  const flatListRef = useRef(null);
  const panRef = useRef<React.Ref<any> | undefined>(undefined);

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.topView}>
          <Text style={styles.yourItems}>Your items</Text>
          <Text style={styles.seeMenu}>see menu</Text>
        </View>
        <FlatList ref={flatListRef} data={allItems} simultaneousHandlers={panRef} keyExtractor={(_item, _) => _item.id.toString()} renderItem={renderItem} />
      </View>
    </View>
  );

  function renderItem({ item }: { item: IFoodItem }) {
    return <FoodItem simultaneousHandlers={flatListRef} passRef={(ref) => panRef.current = ref} data={item} onRemove={handleRemove} />;
  }

  function handleRemove(id: number) {
    setAllItems(prevState => prevState.filter(item => item.id !== id));
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    height: 200,
    width: '100%'
  },
  topView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 6
  },
  yourItems: {
    fontSize: 16,
    fontWeight: '500'
  },
  seeMenu: {
    color: 'green',
    fontWeight: '500'
  }
});

export default App;
