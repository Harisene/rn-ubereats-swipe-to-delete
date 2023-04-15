import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IFoodItem } from '../../App';
import { PanGestureHandler, PanGestureHandlerGestureEvent, PanGestureHandlerProps } from 'react-native-gesture-handler';
import Animated, { Easing, Extrapolation, interpolate, runOnJS, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

interface Props extends Pick<PanGestureHandlerProps, 'simultaneousHandlers'> {
  data: IFoodItem;
  passRef:  (ref: React.Ref<any> | undefined) => void;
  onRemove?: (id: number) => void;
}

type ContextType = {
  translateX: number;
  prevX: number;
  temp: number;
};

const ITEM_HEIGHT = 56;
const { width: DEVICE_WIDTH } = Dimensions.get('window');
const DELETE_BUTTON_WIDTH = DEVICE_WIDTH * 0.3;
const SWIPE_THRESHOLD = DELETE_BUTTON_WIDTH;

const FoodItem: React.FC<Props> = ({ data, passRef, onRemove, simultaneousHandlers }) => {

  const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

  const transX = useSharedValue(0);
  const viewHeight = useSharedValue(ITEM_HEIGHT);

  const panGestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, ContextType>({
    onStart(_, context) {
      context.translateX = transX.value;
      context.temp = 0;
    },
    onActive(event, context) {

      const isSwipingLeft = context.prevX ? context.prevX >= event.translationX : true;

      if (transX.value >= 0 && !isSwipingLeft) {
        transX.value = 0;
        return;
      }

      if (-transX.value > SWIPE_THRESHOLD && isSwipingLeft) {
        const temp = (event.translationX + context.translateX) * 0.005 + transX.value;
        transX.value = withTiming(temp, { duration: 0 });
        context.temp = temp;
      } else if(context.temp) {
        transX.value = transX.value - (context.prevX - event.translationX);
      } else {
        transX.value = event.translationX + context.translateX;
      }

      context.prevX = event.translationX;
    },
    onEnd(event, _) {
      if (-event.translationX < SWIPE_THRESHOLD / 2) {
        transX.value = withTiming(0, { duration: 300, easing: Easing.quad });
      } else {
        transX.value = withTiming(-SWIPE_THRESHOLD, { duration: 300, easing: Easing.quad });
      }
    }
  }, []);

  const rInnerContainer = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: transX.value }]
    }
  }, [transX.value]);

  const rDeleteViewStyles = useAnimatedStyle(() => {

    const scale = interpolate(-transX.value, [0, DELETE_BUTTON_WIDTH * 0.6, DELETE_BUTTON_WIDTH], [1, 0.8, 1.2], Extrapolation.CLAMP);

    return {
      width: -transX.value,
      height: -transX.value,
      transform: [{ scale }]
    }
  }, [transX.value]);

  const rTextContainer = useAnimatedStyle(() => {
    return {
      width: -transX.value
    }
  }, [transX.value]);

  const rMinusIcon = useAnimatedStyle(() => {
    return {
      opacity: interpolate(-transX.value, [0, DELETE_BUTTON_WIDTH * 0.4 , DELETE_BUTTON_WIDTH * 0.6, DELETE_BUTTON_WIDTH], [0, 0.4, 0.7, 0], Extrapolation.CLAMP),
      transform: [{scale: interpolate(-transX.value, [0, DELETE_BUTTON_WIDTH * 0.4 , DELETE_BUTTON_WIDTH * 0.7], [0, 0.5, 1.3], Extrapolation.CLAMP)}]
    }
  }, [transX.value]);

  const rRemove = useAnimatedStyle(() => {
    return {
      opacity: interpolate(-transX.value, [0, DELETE_BUTTON_WIDTH * 0.8 , DELETE_BUTTON_WIDTH, DELETE_BUTTON_WIDTH * 1.5,  DELETE_BUTTON_WIDTH * 2.0], [0, 0, 1, 1, 0], Extrapolation.CLAMP),
    }
  }, [transX.value]);

  const rRemoving = useAnimatedStyle(() => {
    return {
      opacity: interpolate(-transX.value, [DELETE_BUTTON_WIDTH * 1.5, DELETE_BUTTON_WIDTH * 2.0], [0, 1], Extrapolation.CLAMP),
    }
  }, [transX.value]);

  const rDeleteContainer = useAnimatedStyle(() => {
    return {
      height: withTiming(viewHeight.value, { duration: 300 }, () => {
        if (viewHeight.value === 0) {
          onRemove && runOnJS(onRemove)(data.id);
        }
      }),
      opacity: withTiming(viewHeight.value === 0 ? 0 : 1, { duration: 300 })
    }
  }, [viewHeight.value]);

  
  return (
    <Animated.View style={[styles.container, rDeleteContainer]}>
      <View style={styles.deleteContainer}>
        <Animated.View style={[styles.deleteInnerContainer, rDeleteViewStyles]}/>
        <AnimatedTouchableOpacity style={[styles.textContainer, rTextContainer]} onPress={handlePress}>
          <Animated.Text style={[styles.minusIcon, rMinusIcon]}>-</Animated.Text>
          <Animated.Text style={[styles.remove, rRemove]}>REMOVE ITEM</Animated.Text>
          <Animated.Text style={[styles.remove, rRemoving]}>REMOVING</Animated.Text>
        </AnimatedTouchableOpacity>
      </View>
      <PanGestureHandler ref={(ref) => passRef(ref)} simultaneousHandlers={simultaneousHandlers} onGestureEvent={panGestureHandler}>
        <Animated.View style={[styles.innerContainer, rInnerContainer]}>
          <View style={styles.quantityContainer}>
            <Text>{data.quantity}</Text>
          </View>
          <View style={styles.itemsContainer}>
            <Text style={styles.name}>{data.name}</Text>
            <Text style={styles.amount}>{data.amount}</Text>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  )

  function handlePress() {
    transX.value = withSpring(-DEVICE_WIDTH, undefined, () => {
      viewHeight.value = 0;
    });
  }
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    height: ITEM_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    height: ITEM_HEIGHT,
    paddingHorizontal: 20,
  },
  deleteContainer: {
    position: 'absolute',
    right: 0,
    backgroundColor: 'lightgrey',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: '100%',
    width: DELETE_BUTTON_WIDTH
  },
  deleteInnerContainer: {
    position: 'absolute',
    backgroundColor: '#ff5050',
    borderRadius: 200,
    justifyContent: 'center',
    alignItems: 'center'
  },
  textContainer: {
    height: ITEM_HEIGHT,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center'
  },
  minusIcon: {
    fontSize: 26,
    color: 'white',
    fontWeight: '600'
  },
  remove: {
    position: 'absolute',
    fontSize: 14,
    color: 'white',
    fontWeight: '600'
  },
  quantityContainer: {
    backgroundColor: '#f2f2f2',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4
  },
  itemsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexGrow: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 12
  },
  amount: {
    textAlign: 'right'
  }
})


export default FoodItem;