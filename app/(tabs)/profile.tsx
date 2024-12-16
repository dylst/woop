import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';

interface ReviewItemProps {
  image: string;
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
      <Image source={{ uri: image }} style={styles.reviewImage} />
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
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle='dark-content'
        backgroundColor={Colors.primary.lightteal}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header section */}
        <View style={styles.headerContent}>
          <Image
            source={{ uri: 'https://placeholder.com/150' }}
            style={styles.profileImage}
          />
          <ThemedText style={styles.userName}>Kyle Kiwikaka</ThemedText>
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
              <TouchableOpacity style={styles.actionButton}>
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
              <Pressable style={styles.tabButton}>
                <ThemedText style={[styles.tab, styles.activeTab]}>
                  Reviews
                </ThemedText>
                <View style={styles.activeTabIndicator} />
              </Pressable>
              <Pressable style={styles.tabButton}>
                <ThemedText style={styles.tab}>Photos</ThemedText>
              </Pressable>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <ThemedText style={styles.statNumber}>20</ThemedText>
              <ThemedText style={styles.statLabel}>
                reactions all time
              </ThemedText>
            </View>
            <View style={styles.statBox}>
              <ThemedText style={styles.statNumber}>44</ThemedText>
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
              image='https://example.com/crab-shack.jpg'
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
            image='https://example.com/boba.jpg'
            title="Melody's Boba Noodles"
            description='A good helping of buckshots and boba'
            rating={4}
            reviewCount={35}
          />
          <ReviewItem
            image='https://example.com/ramen.jpg'
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
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#000',
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
});

export default ProfileScreen;