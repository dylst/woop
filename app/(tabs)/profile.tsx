import React, { useEffect, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  SafeAreaView,
  StatusBar,
  Modal,
  Share,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import { useUser } from '../context/UserContext';
import { supabase } from '@/supabaseClient';
import * as Clipboard from 'expo-clipboard';

interface ReviewItemProps {
  image: any;
  title: string;
  description: string;
  rating: number;
  reviewCount?: number;
}

const ReviewItem: React.FC<ReviewItemProps> = ({
  image,
  title,
  description,
  rating,
  reviewCount,
}) => (
  <View style={styles.reviewItem}>
    <View style={styles.reviewContent}>
      <Image source={image} style={styles.reviewImage} />
      <View style={styles.reviewDetails}>
        <ThemedText style={styles.reviewTitle}>{title}</ThemedText>
        <ThemedText style={styles.reviewDescription}>{description}</ThemedText>
        <View style={styles.ratingContainer}>
          {[...Array(5)].map((_, i) => (
            <ThemedText key={i} style={styles.starIcon}>
              {i < rating ? '★' : '☆'}
            </ThemedText>
          ))}
          {reviewCount && (
            <ThemedText style={styles.reviewCount}>({reviewCount})</ThemedText>
          )}
        </View>
      </View>
    </View>
    <Pressable style={styles.heartIcon}>
      <Ionicons name='heart-outline' size={24} color='#666' />
    </Pressable>
  </View>
);

interface StatItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  count: number;
}

const StatItem: React.FC<StatItemProps> = ({ icon, count }) => (
  <View style={styles.statItem}>
    <Ionicons name={icon} size={16} color={Colors.primary.darkteal} />
    <ThemedText style={styles.statText}>{count}</ThemedText>
  </View>
);

const ProfileScreen = () => {
  const { user } = useUser();
  const userId = user?.id;

  const [userData, setUserData] = useState<any>(null);
  const [activeTab, setActiveTab] = React.useState('reviews');
  const [showShareModal, setShowShareModal] = useState(false);

  const fetchProfile = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.log('Error fetching profile:', error);
      return;
    }

    setUserData(data);
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const firstName = userData?.first_name || '';
  const lastName = userData?.last_name || '';
  const city = userData?.city || '';
  const state = userData?.state || '';

  const handleShare = async (platform?: string) => {
    const profileUrl = `https://woop.com/profile/${userData?.username}`; // Replace with your actual domain

    if (platform) {
      let url = '';
      switch (platform) {
        case 'instagram':
          url = `instagram://share?text=Check out my food profile on Woop!&url=${encodeURIComponent(
            profileUrl
          )}`;
          break;
        case 'facebook':
          url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            profileUrl
          )}`;
          break;
        case 'sms':
          url = `sms:&body=Check out my food profile on Woop! ${profileUrl}`;
          break;
      }

      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          // Fallback to default share if app not installed
          await Share.share({
            message: `Check out my food profile on Woop! ${profileUrl}`,
          });
        }
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await Share.share({
          message: `Check out my food profile on Woop! ${profileUrl}`,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
    setShowShareModal(false);
  };

  const copyProfileLink = async () => {
    const profileUrl = `https://woop.com/profile/${userData?.username}`; // we would replace this with the actual domain
    await Clipboard.setStringAsync(profileUrl);
    setShowShareModal(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle='dark-content'
        backgroundColor={Colors.primary.lightteal}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header section with History, Share and Settings buttons */}
        <View style={styles.headerButtons}>
          <View style={styles.leftHeaderButton}>
            <Pressable
              style={styles.iconButton}
              onPress={() => router.push('/owner')}
            >
              <Ionicons
                name='sync-outline'
                size={24}
                color={Colors.primary.darkteal}
              />
            </Pressable>
          </View>
          <View style={styles.rightHeaderButtons}>
            <Pressable
              style={styles.rightIconButton}
              onPress={() => setShowShareModal(true)}
            >
              <Ionicons
                name='share-outline'
                size={24}
                color={Colors.primary.darkteal}
              />
            </Pressable>
            <Pressable
              style={styles.rightIconButton}
              onPress={() => router.push('/profileSettings')}
            >
              <Ionicons
                name='settings-outline'
                size={24}
                color={Colors.primary.darkteal}
              />
            </Pressable>
          </View>
        </View>

        {/* Share Modal */}
        <Modal
          animationType='fade'
          transparent={true}
          visible={showShareModal}
          onRequestClose={() => setShowShareModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>Share Profile</ThemedText>
                <Pressable onPress={() => setShowShareModal(false)}>
                  <Ionicons name='close' size={24} color='#000' />
                </Pressable>
              </View>

              <TouchableOpacity
                style={styles.shareOption}
                onPress={() => handleShare('instagram')}
              >
                <Ionicons name='logo-instagram' size={24} color='#E4405F' />
                <ThemedText style={styles.shareOptionText}>
                  Share to Instagram
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareOption}
                onPress={() => handleShare('facebook')}
              >
                <Ionicons name='logo-facebook' size={24} color='#3b5998' />
                <ThemedText style={styles.shareOptionText}>
                  Share to Facebook
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareOption}
                onPress={() => handleShare('sms')}
              >
                <Ionicons name='chatbubble-outline' size={24} color='#34B7F1' />
                <ThemedText style={styles.shareOptionText}>
                  Share via SMS
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareOption}
                onPress={copyProfileLink}
              >
                <Ionicons name='copy-outline' size={24} color='#666' />
                <ThemedText style={styles.shareOptionText}>
                  Copy Profile Link
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareOption}
                onPress={() => handleShare()}
              >
                <Ionicons
                  name='ellipsis-horizontal-outline'
                  size={24}
                  color='#000'
                />
                <ThemedText style={styles.shareOptionText}>
                  More Options
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Header content */}
        <View style={styles.headerContent}>
          <Image
            source={{ uri: userData?.avatar }}
            style={styles.profileImage}
          />
          <ThemedText style={styles.userName}>@{userData?.username}</ThemedText>
          {(firstName || lastName) && (
            <ThemedText style={styles.realName}>
              {firstName} {lastName}
            </ThemedText>
          )}
          {city && state && (
            <ThemedText style={styles.address}>
              {city}, {state}
            </ThemedText>
          )}
          {/* Stats section */}
          <View style={styles.statsSection}>
            <View style={styles.statsContainer}>
              <StatItem icon='people-outline' count={10} />
              <StatItem icon='star-outline' count={8} />
              <StatItem icon='camera-outline' count={6} />
            </View>
          </View>

          {/* Action Buttons section */}
          <View style={styles.actionButtonsSection}>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/food/add-food-item')}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons
                    name='fast-food-outline'
                    size={24}
                    color={Colors.primary.darkteal}
                  />
                </View>
                <ThemedText style={styles.actionButtonText}>
                  Add Food
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/add-review')}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons
                    name='create-outline'
                    size={24}
                    color={Colors.primary.darkteal}
                  />
                </View>
                <ThemedText style={styles.actionButtonText}>
                  Add Review
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <View style={styles.actionIconContainer}>
                  <Ionicons
                    name='camera-outline'
                    size={24}
                    color={Colors.primary.darkteal}
                  />
                </View>
                <ThemedText style={styles.actionButtonText}>
                  Add Photo
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/preferences')}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons
                    name='options-outline'
                    size={24}
                    color={Colors.primary.darkteal}
                  />
                </View>
                <ThemedText style={styles.actionButtonText}>
                  Preferences
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Separator */}
        <View style={styles.separator} />

        {/* Aura Section */}
        <View style={styles.mainContent}>
          <ThemedText style={styles.auraTitle}>Aura (10,000)</ThemedText>

          {/* Tabs Section */}
          <View style={styles.tabContainer}>
            <View style={styles.tabWrapper}>
              <Pressable
                style={styles.tabButton}
                onPress={() => setActiveTab('reviews')}
              >
                <ThemedText
                  style={[
                    styles.tab,
                    activeTab === 'reviews' && styles.activeTab,
                  ]}
                >
                  Reviews
                </ThemedText>
                {activeTab === 'reviews' && (
                  <View style={styles.activeTabIndicator} />
                )}
              </Pressable>
              <Pressable
                style={styles.tabButton}
                onPress={() => setActiveTab('photos')}
              >
                <ThemedText
                  style={[
                    styles.tab,
                    activeTab === 'photos' && styles.activeTab,
                  ]}
                >
                  Photos
                </ThemedText>
                {activeTab === 'photos' && (
                  <View style={styles.activeTabIndicator} />
                )}
              </Pressable>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <ThemedText style={styles.statNumber}>
                {activeTab === 'reviews' ? 20 : 3}
              </ThemedText>
              <ThemedText style={styles.statLabel}>
                reactions all time
              </ThemedText>
            </View>
            <View style={styles.statBox}>
              <ThemedText style={styles.statNumber}>
                {activeTab === 'reviews' ? 44 : 12}
              </ThemedText>
              <ThemedText style={styles.statLabel}>
                views last 90 days
              </ThemedText>
            </View>
          </View>

          {/* Currently Trending Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              Currently Trending
            </ThemedText>
            <ReviewItem
              image={require('@/assets/images/try_something_new_dietary.png')}
              title="Dom's Crab Shack"
              description="Dom's Crabs are AMAZING!"
              rating={5}
            />
          </View>
        </View>
        {/* Separator */}
        <View style={styles.separator} />

        {/* Recently Viewed Section */}
        <View style={styles.recentlyViewedSection}>
          <ThemedText style={styles.sectionTitle}>Recently Viewed</ThemedText>
          <ReviewItem
            image={require('@/assets/images/food/barbecue.jpg')}
            title="Melody's Boba Noodles"
            description='A good helping of buckshots and boba'
            rating={4}
            reviewCount={35}
          />
          <ReviewItem
            image={require('@/assets/images/try_something_new_cuisine.png')}
            title="Jay's Instant Ramen"
            description='Ramen you can buy in stores but with a twist'
            rating={4}
            reviewCount={35}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContent: {
    alignItems: 'center',
    padding: 20,
  },
  profileSettings: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 4,
    zIndex: 999,
    elevation: 8,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 10,
    color: Colors.primary.darkteal,
  },
  realName: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 6,
    color: '#000',
  },
  address: {
    fontSize: 16,
    marginTop: 2,
    marginBottom: 4,
    color: '#555',
  },
  statsSection: {
    backgroundColor: '#fff',
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 16,
    color: Colors.primary.darkteal,
  },
  actionButtonsSection: {
    backgroundColor: '#fff',
    padding: 5,
    marginTop: 0,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: 10,
  },
  actionIconContainer: {
    backgroundColor: Colors.primary.lightteal,
    padding: 12,
    borderRadius: 50,
  },
  actionButtonText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
  },
  mainContent: {
    padding: 20,
  },
  auraTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000',
  },
  tabContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  tabWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '80%',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  tab: {
    paddingVertical: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    width: '100%',
  },
  activeTab: {
    color: Colors.primary.darkteal,
    fontWeight: '600',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 2,
    backgroundColor: Colors.primary.darkteal,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 30,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  statLabel: {
    opacity: 0.6,
    color: '#000',
    fontSize: 14,
  },
  section: {
    marginBottom: 10,
  },
  recentlyViewedSection: {
    padding: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000',
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  reviewContent: {
    flexDirection: 'row',
    flex: 1,
  },
  reviewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  reviewDetails: {
    flex: 1,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#000',
  },
  reviewDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
    color: '#000',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    color: '#FFD700',
    fontSize: 16,
  },
  reviewCount: {
    marginLeft: 4,
    fontSize: 14,
    opacity: 0.6,
    color: '#000',
  },
  heartIcon: {
    padding: 8,
  },
  separator: {
    height: 10,
    backgroundColor: Colors.primary.lightteal,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    position: 'absolute',
    left: 10,
    right: 10,
    top: 10,
    zIndex: 999,
  },
  leftHeaderButton: {
    flexDirection: 'row',
  },
  rightHeaderButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 4,
  },
  rightIconButton: {
    padding: 4,
    marginLeft: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  shareOptionText: {
    marginLeft: 15,
    fontSize: 16,
  },
});

export default ProfileScreen;
