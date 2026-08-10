import { motion } from "framer-motion";
import { Brain, Globe2, Cpu, Sunrise } from "lucide-react";

const CARDS = [
  {
    icon: Brain,
    title: "ذكاء يفهمك",
    description:
      "يفهم لغتك وطريقة تفكيرك، ويتعامل مع الأسئلة العربية والفصحى والعامية بعمق.",
    gradient: "from-sky-500/20 to-blue-600/20",
    iconColor: "text-sky-400",
  },
  {
    icon: Globe2,
    title: "مصمم للعالم العربي",
    description:
      "بُني من البداية ليخدم المستخدم العربي، ليس ترجمة لمنتج أجنبي.",
    gradient: "from-blue-600/20 to-violet-600/20",
    iconColor: "text-blue-400",
  },
  {
    icon: Cpu,
    title: "تجربة AI متطورة",
    description:
      "أحدث تقنيات الذكاء الاصطناعي في واجهة أنيقة وسريعة مصممة لكل لحظة في يومك.",
    gradient: "from-violet-600/20 to-purple-500/20",
    iconColor: "text-violet-400",
  },
  {
    icon: Sunrise,
    title: "قادم ليكون جزءاً من يومك",
    description:
      "مرافقك اليومي في العمل والدراسة والإبداع — من الفكرة الأولى إلى الإنجاز.",
    gradient: "from-purple-500/20 to-sky-500/20",
    iconColor: "text-purple-400",
  },
];

export default function WhyErkan() {
  return (
    <section id="why" className="relative z-10 px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
          className="mb-12 text-center"
        >
          <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
            لماذا <span className="text-gradient-brand">ERKAN AI</span>؟
          </h2>
          <p className="mt-3 text-muted-foreground">
            منتج مختلف، يُولد من منطقته وينافس عالمياً.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.6,
                delay: i * 0.09,
                ease: [0.23, 1, 0.32, 1],
              }}
              className="glass-card group rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1.5"
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr ${card.gradient}`}>
                <card.icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
              <h3 className="mb-2 text-lg font-bold text-white">{card.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{card.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
