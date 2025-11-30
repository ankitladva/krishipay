import { connectDB } from './db';
import Scheme from './models/Scheme';

const governmentSchemes = [
  {
    title: 'PM-KISAN योजना',
    description: 'प्रधानमंत्री किसान सम्मान निधि - सभी किसानों के लिए प्रत्यक्ष वित्तीय सहायता',
    benefits: '₹6,000 प्रति वर्ष तीन किस्तों में',
    loanType: 'General',
    eligibility: 'सभी भूमिधारी किसान परिवार',
    icon: 'Wallet',
  },
  {
    title: 'कृषि यंत्र सब्सिडी',
    description: 'ट्रैक्टर और कृषि उपकरणों की खरीद पर सब्सिडी',
    benefits: 'ट्रैक्टर मूल्य पर 50% तक सब्सिडी',
    loanType: 'Tractor',
    eligibility: '2 हेक्टेयर से अधिक भूमि वाले किसान',
    icon: 'Tractor',
  },
  {
    title: 'डेयरी उद्यमिता योजना',
    description: 'डेयरी फार्म स्थापना के लिए वित्तीय सहायता',
    benefits: 'परियोजना लागत का 33% पूंजी सब्सिडी',
    loanType: 'Dairy',
    eligibility: 'डेयरी व्यवसाय शुरू करने वाले किसान',
    icon: 'Milk',
  },
  {
    title: 'कृषि अवसंरचना कोष',
    description: 'भंडारण, प्रसंस्करण और अन्य बुनियादी ढांचे के लिए ऋण',
    benefits: '₹2 करोड़ तक का ऋण, 3% ब्याज सब्सिडी',
    loanType: 'Equipment',
    eligibility: 'कृषि उद्यमी और FPO',
    icon: 'Warehouse',
  },
  {
    title: 'किसान क्रेडिट कार्ड',
    description: 'फसल ऋण और अन्य कृषि जरूरतों के लिए',
    benefits: '₹3 लाख तक 4% ब्याज दर पर ऋण',
    loanType: 'General',
    eligibility: 'सभी किसान (भूमि मालिक या किरायेदार)',
    icon: 'CreditCard',
  },
  {
    title: 'प्रधानमंत्री फसल बीमा योजना',
    description: 'प्राकृतिक आपदाओं से फसल नुकसान का बीमा',
    benefits: 'कम प्रीमियम पर व्यापक फसल बीमा',
    loanType: 'General',
    eligibility: 'सभी किसान',
    icon: 'Shield',
  },
  {
    title: 'मृदा स्वास्थ्य कार्ड',
    description: 'मिट्टी परीक्षण और पोषक तत्व प्रबंधन',
    benefits: 'मुफ्त मिट्टी परीक्षण और सिफारिशें',
    loanType: 'Seeds',
    eligibility: 'सभी किसान',
    icon: 'Sprout',
  },
];

export async function seedDatabase() {
  try {
    await connectDB();
    
    // Clear existing schemes
    await Scheme.deleteMany({});
    
    // Insert new schemes
    await Scheme.insertMany(governmentSchemes);
    
    console.log(`✅ Seeded ${governmentSchemes.length} government schemes`);
    
    return { success: true, count: governmentSchemes.length };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Database seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database seeding failed:', error);
      process.exit(1);
    });
}

