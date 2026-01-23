import img1 from '../assets/products/kerala_kasavu_trench_1_1767025032580.png';
import img2 from '../assets/products/kerala_emerald_3piece_2_1767025070993.png';
import img3 from '../assets/products/kerala_white_kurti_3_1767025090194.png';
import img5 from '../assets/products/kerala_blue_fusion_5_1767025120457.png';
import img6 from '../assets/products/kerala_tussar_suit_6_1767025138655.png';
// Reusing images for a full catalog feel
const img4 = img3;

import { Product } from '../types';

export const products: Product[] = [
    {
        id: 1,
        title: "Kasavu Modern Trench",
        code: "KL-25-001",
        price: "₹1,45,000",
        description: "A reimagining of the classic Kasavu. Handloom Kerala cotton transformed into a structured trench coatset with thick golden zari borders. Perfect for the modern Malayali woman.",
        image: img1,
        sizes: ['S', 'M', 'L']
    },
    {
        id: 2,
        title: "Emerald Zari 3-Piece",
        code: "KL-25-002",
        price: "₹1,89,000",
        description: "Festive elegance defined. A deep emerald green silk 3-piece suit featuring a long jacket with intricate gold zari work, paired with tailored trousers.",
        image: img2,
        sizes: ['M', 'L', 'XL']
    },
    {
        id: 3,
        title: "Cochin Breeze Kurti",
        code: "KL-25-003",
        price: "₹85,000",
        description: "Inspired by the colonial charm of Fort Kochi. A breezy white linen kurti with subtle antique gold embroidery and an asymmetrical hem.",
        image: img3,
        sizes: ['S', 'M', 'L']
    },
    {
        id: 4,
        title: "Varkala Linen Set",
        code: "KL-25-004",
        price: "₹1,15,000",
        description: "Resort wear for the cliffs of Varkala. Premium linen co-ord set in a pristine white, offering relaxed luxury.",
        image: img4,
        sizes: ['S', 'M', 'L']
    },
    {
        id: 5,
        title: "Royal Travancore Fusion",
        code: "KL-25-005",
        price: "₹1,65,000",
        description: "Regal blues meet temple gold. A raw silk jacket and skirt fusion set that pays homage to the Travancore heritage with a modern twist.",
        image: img5,
        sizes: ['M', 'L']
    },
    {
        id: 6,
        title: "Tussar Executive Suit",
        code: "KL-25-006",
        price: "₹1,35,000",
        description: "Power dressing with a Kerala touch. Rich beige Tussar silk tailored into a sharp coat suit for the boardroom.",
        image: img6,
        sizes: ['S', 'M', 'L']
    },
    {
        id: 7,
        title: "Malabar Rose Silk",
        code: "KL-25-007",
        price: "₹1,25,000",
        description: "Soft silks inspired by the Malabar coast sunsets.",
        image: img2,
        sizes: ['M', 'L']
    },
    {
        id: 8,
        title: "Munnar Mist Trench",
        code: "KL-25-008",
        price: "₹1,45,000",
        description: "Cool and crisp, like the hills of Munnar. Another variation of our signature Kasavu trench.",
        image: img1,
        sizes: ['S', 'M']
    },
];
