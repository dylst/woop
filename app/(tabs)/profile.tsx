import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';

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
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with curved background */}
        <View style={styles.headerBackground}>
          <View style={styles.headerContent}>
            <Image
              source={{ uri: 'https://placeholder.com/150' }}
              style={styles.profileImage}
            />
            <ThemedText style={styles.userName}>Kyle Kiwikaka</ThemedText>
            <View style={styles.statsContainer}>
              <StatItem icon='people-outline' count={10} />
              <StatItem icon='star-outline' count={8} />
              <StatItem icon='camera-outline' count={6} />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIconContainer}>
              <Ionicons
                name='create-outline'
                size={24}
                color={Colors.primary.darkteal}
              />
            </View>
            <ThemedText style={styles.actionButtonText}>Add Review</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIconContainer}>
              <Ionicons
                name='camera-outline'
                size={24}
                color={Colors.primary.darkteal}
              />
            </View>
            <ThemedText style={styles.actionButtonText}>Add Photo</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIconContainer}>
              <Ionicons
                name='options-outline'
                size={24}
                color={Colors.primary.darkteal}
              />
            </View>
            <ThemedText style={styles.actionButtonText}>Preferences</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Aura Section */}
        <View style={styles.mainContent}>
          <ThemedText style={styles.auraTitle}>Aura (10,000)</ThemedText>

          <View style={styles.tabContainer}>
            <ThemedText style={styles.activeTab}>Reviews</ThemedText>
            <ThemedText style={styles.tab}>Photos</ThemedText>
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

          {/* Recently Viewed Section */}
          <View style={styles.section}>
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerBackground: {
    backgroundColor: Colors.primary.lightteal,
    height: 200,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
    marginBottom: 10,
    color: '#000',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  statText: {
    fontSize: 16,
    color: '#000',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    marginTop: -40,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIconContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    marginTop: 8,
    fontSize: 12,
    color: '#000',
  },
  mainContent: {
    padding: 20,
  },
  auraTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 10,
    marginRight: 20,
    opacity: 0.6,
    color: '#000',
  },
  activeTab: {
    paddingVertical: 10,
    marginRight: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
    color: '#000',
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000',
  },
  statLabel: {
    opacity: 0.6,
    color: '#000',
  },
  section: {
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
  },
  heartIcon: {
    padding: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});

export default ProfileScreen;
