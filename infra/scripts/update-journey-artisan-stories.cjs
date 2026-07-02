const fs = require("node:fs");
const path = require("node:path");
const { PrismaClient, Prisma } = require("@prisma/client");

const prisma = new PrismaClient();

const profiles = [
  {
    match: (key) => key.includes("kanti") || key.includes("kaanti") || key.includes("dhurve"),
    quote:
      "Initially, I used to wonder how I would manage. Today, I have confidence in myself.",
    storyTitle: "The Woman Who Discovered Her Strength Beyond Her Village",
    storyParagraphs: [
      "For most of her life, Kanti Dhurve's world revolved around her home.",
      "Living in a village nearly 30 kilometres from Betul, the 34-year-old mother of two spent her days caring for her family, managing household responsibilities, and believing that life would always follow the same rhythm. She had completed her education until Class 12, but stepping outside the village for work was never something she imagined for herself.",
      "That changed when life demanded it.",
      "A few years ago, her husband developed health complications that prevented him from taking up regular employment. Whatever little farming the family could manage was no longer enough to support the household or the education of their two sons, now studying in Classes 9 and 6. Like many rural families, they found themselves trying to make ends meet with uncertain agricultural income.",
      "For Kanti, the decision to work was not simply about earning money, it was about protecting her children's future.",
      "Joining Rangbheeni a year and a half ago was her first experience of formal employment. The transition was intimidating. Travelling outside her village felt unfamiliar, and commuting nearly 30 kilometres every day seemed almost impossible. Yet, every morning she chose to continue.",
      "What began as necessity slowly transformed into confidence.",
      "At Rangbheeni, Kanti found more than employment. She found a space where she could learn, create and believe in her own abilities. Through textile upcycling, she became part of a team that turns discarded fabric into handcrafted products with purpose. The work gave her a steady source of income, but it also introduced her to opportunities she had never imagined.",
      "Today, the woman who once hesitated to leave her village has represented Rangbheeni at exhibitions in cities such as Jaipur and Bhopal. Standing behind stalls, interacting with customers, explaining products and managing sales, roles that once felt unimaginable have become a part of her journey. Every exhibition has expanded her world a little more.",
      "At home, the impact has been equally significant. With her earnings, supported by their small agricultural income, the family has been able to continue both children's education without interruption. In many ways, Kanti has become the pillar her family now depends upon.",
      "When she reflects on her journey, she doesn't speak about achievements in grand terms. Instead, she speaks about confidence.",
      "\"Initially, I used to wonder how I would manage. Today, I have confidence in myself. I want other women to step out, work and become independent. When we earn, we can fulfil not only our own dreams but also give our children the opportunities they deserve.\"",
      "Her story reminds us that empowerment is often quiet. It begins with one decision, one journey beyond familiar roads, one opportunity that allows a woman to discover strengths she never knew she possessed.",
      "At Rangbheeni, Kanti is not only crafting products from discarded fabric, she is weaving a future built on resilience, dignity and hope."
    ]
  },
  {
    match: (key) => key.includes("nausa") || key.includes("nauvsa") || key.includes("parpachi"),
    quote: "If I don't stand up for myself, who will?",
    storyTitle: "Choosing Her Own Future, One Stitch at a Time",
    storyParagraphs: [
      "When Nausa speaks about her life, there is no trace of self-pity. Instead, there is quiet determination.",
      "Growing up in Chinchdhana village in Madhya Pradesh, she completed her education only until Class 10. The school was four to five kilometres away, and during the monsoon, flooded roads often made the journey nearly impossible. Financial constraints eventually forced her to leave school. Like many girls in her village, her days became centred around agriculture, grazing goats and helping her family make a living from land that depended entirely on rainfall.",
      "Yet even then, she carried dreams beyond the boundaries of her village. She wanted to become a nurse or perhaps a police officer.",
      "Life took a different path.",
      "Married at the age of twenty, Nausa taught herself stitching without any formal training. Sewing blouses became her first source of income and a reminder that learning does not always happen inside classrooms. Later, while working with PRADAN, she became involved in poultry farming and community development. More importantly, she learned about employment rights, local governance and the importance of speaking up when systems fail the people they are meant to serve.",
      "She recalls questioning why machines replaced workers under employment schemes, or why government records often claimed facilities existed when villages had never seen them. Standing up for these issues gave her a sense of purpose, but it also came with challenges.",
      "Her work required travelling across villages, something her husband opposed. Over time, she experienced domestic violence, struggled with alcoholism within the family and realised that staying silent would not create a better future for her children.",
      "She made a difficult choice.",
      "Leaving behind familiar surroundings, she moved to Betul in search of better education for her children and a life where she could support herself with dignity. The decision was not welcomed. She faced criticism, suspicion and isolation from extended family members who questioned her independence. At one point, she was even expected to give up her work if she remarried.",
      "She refused.",
      "\"If I don't stand up for myself, who will?\" she says.",
      "For the past two years, Rangbheeni has become an important chapter in that journey. Here, Nausa transformed her stitching skills into textile upcycling, creating products from discarded fabric while contributing to a more sustainable future. She values the work not only because it provides an income, but because it respects her skills and encourages her to keep growing.",
      "Life is still far from easy. Much of her earnings go towards rent, school fees and loan repayments. She rarely has time for herself. Basic infrastructure, healthcare and transportation remain everyday challenges.",
      "Yet what stands out most is not what she lacks—it is what she continues to build.",
      "She dreams of completing her own education. She dreams of seeing her children study without interruption. She dreams of a future where women are recognised for their abilities rather than judged for the choices they make.",
      "Nausa's story is not only about overcoming hardship. It is about choosing dignity over dependence, courage over convention and possibility over circumstance.",
      "Every piece she creates at Rangbheeni carries more than craftsmanship. It carries the story of a woman who chose to stitch together a new life for herself and for the generations that will follow."
    ]
  },
  {
    match: (key) => key.includes("priya") || key.includes("pandagre"),
    quote:
      "Through Rangbheeni, I have gained financial stability, purpose and community.",
    storyTitle: "My Journey with Rangbheeni",
    storyParagraphs: [
      "My name is Priya Pandagre, and I come from Dhohdwada village. My journey with Rangbheeni, a social enterprise focused on empowering women through skill development and employment opportunities, has significantly impacted my life and that of my family. Here, I share my story, the challenges I faced, and how Rangbheeni has helped me transform my life.",
      "I was born and brought up in Jeen village in a family deeply rooted in agriculture. My family consisted of my parents and two brothers. Both my parents and one of my brothers were involved in farming, while the other brother worked in furniture. My brothers studied up to the 7th grade, but I was fortunate enough to complete my education till the 12th grade.",
      "At the age of 21, I got married and moved into my husband’s family, which included my father-in-law, mother-in-law, sister-in-law, my husband, and myself. My in-laws and husband were all engaged in agricultural activities, while my sister-in-law was still studying. Our family’s annual income ranged from 40,000 to 50,000 INR, primarily earned by my husband. We have two children, a 7-year-old daughter and a 4-year-old son, both of whom attend school in Bhadhus. They travel to school by bus, with the expenses covered by my husband. The approximate annual cost of their education is between 40,000 and 50,000 INR.",
      "I first learned about Rangbheeni during a field visit by Kumkum Didi to Dhohdwada. She gathered the local women and introduced us to the organization. Already having a passion for sewing, I was immediately interested when I learned that Rangbheeni involved creative and varied sewing projects. This motivated me to join the organization.",
      "At Rangbheeni, my role involves sorting and cutting cloth pieces according to the required product design, and then sewing various items such as tote bags, scrunchies, bottle bags, and laptop sleeves. The work environment is positive and supportive, and I enjoy learning new things every day. Since joining, I have significantly improved my sewing skills and have learned to make a variety of creative products.",
      "Working at Rangbheeni has had a positive impact on my family. I am now able to contribute financially, which has helped alleviate some of my husband's economic burdens. While I do not have any specific financial goals at the moment, I am saving money to ensure that my children receive a good education in the future.",
      "In addition to my work at Rangbheeni, I benefit from government schemes such as the Ladli Laxmi Yojna and the Ladli Behna Yojna. I did not face any challenges in accessing these benefits, as the Panchayat facilitated the process. During the COVID-19 pandemic, we did not suffer any major hardships or health issues, and our lives remained relatively stable.",
      "Looking ahead, my primary aspiration is for my children to be successful and well-educated. I want to continue supporting them and ensuring they have the opportunities to achieve their dreams. I do not have any grand personal aspirations but focus on being self-reliant and supporting my family.",
      "To other women, my advice is to prioritize your family and children and strive to be self-reliant. For the government, my suggestion is to ensure equal opportunities for employment for everyone and to promote peace and harmony within the community.",
      "My story is a testament to the positive impact that organizations like Rangbheeni can have on women's lives. Through the skills and opportunities provided, I have not only gained financial stability but also a sense of purpose and community. This experience underscores the importance of empowering women to lead independent and dignified lives."
    ]
  }
];

function normalizeKey(value) {
  return String(value || "").toLowerCase().replace(/[^a-z]/g, "");
}

function delegateNameForModel(modelName) {
  return modelName.charAt(0).toLowerCase() + modelName.slice(1);
}

function getPageDelegate() {
  const candidates = Prisma.dmmf.datamodel.models
    .filter((model) => {
      const fields = new Set(model.fields.map((field) => field.name));
      return fields.has("key") && fields.has("content");
    })
    .map((model) => ({
      modelName: model.name,
      delegateName: delegateNameForModel(model.name),
    }))
    .filter((candidate) => prisma[candidate.delegateName]);

  if (candidates.length !== 1) {
    const names = candidates
      .map((candidate) => `${candidate.modelName} -> prisma.${candidate.delegateName}`)
      .join(", ");

    throw new Error(
      `Expected exactly one Prisma model with key/content fields. Found ${candidates.length}: ${names || "none"}`
    );
  }

  return {
    modelName: candidates[0].modelName,
    delegateName: candidates[0].delegateName,
    delegate: prisma[candidates[0].delegateName],
  };
}

async function main() {
  const pageModel = getPageDelegate();
  console.log(`Using Prisma model ${pageModel.modelName} via prisma.${pageModel.delegateName}`);

  const page = await pageModel.delegate.findUnique({
    where: { key: "journey" }
  });

  if (!page) {
    throw new Error('Page with key "journey" was not found.');
  }

  const content = page.content;

  if (!content?.artisans?.items || !Array.isArray(content.artisans.items)) {
    throw new Error("Journey page content does not contain artisans.items.");
  }

  const backupDir = path.join(process.cwd(), "tmp");
  fs.mkdirSync(backupDir, { recursive: true });

  const backupPath = path.join(
    backupDir,
    `journey-page-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
  );

  fs.writeFileSync(backupPath, JSON.stringify(content, null, 2));

  let updatedCount = 0;

  const nextItems = content.artisans.items.map((artisan) => {
    const key = normalizeKey(`${artisan.name || ""} ${artisan.photo || ""}`);
    const profile = profiles.find((item) => item.match(key));

    if (!profile) return artisan;

    updatedCount += 1;

    return {
      ...artisan,
      quote: artisan.quote || profile.quote,
      storyTitle: profile.storyTitle,
      storyParagraphs: profile.storyParagraphs
    };
  });

  if (updatedCount === 0) {
    throw new Error("No matching artisan names/photos were found. No update was written.");
  }

  await pageModel.delegate.update({
    where: { key: "journey" },
    data: {
      content: {
        ...content,
        artisans: {
          ...content.artisans,
          items: nextItems
        }
      }
    }
  });

  console.log(`Updated ${updatedCount} artisan story/stories.`);
  console.log(`Backup written to ${backupPath}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
