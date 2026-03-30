import { createPaperWithRelations } from './queries';
import { runQuery } from './driver';
import { initializeSchema } from './schema';

export async function seedDemoData(): Promise<void> {
  await initializeSchema();

  // Check if data already exists
  const existing = await runQuery<{ count: number }>('MATCH (p:Paper) RETURN count(p) AS count');
  if (existing[0]?.count > 0) {
    console.log('Demo data already loaded, skipping seed');
    return;
  }

  // Create clusters first
  const clusters = [
    { id: 'cluster_transformer_architectures', label: 'Transformer Architectures', summary: 'Papers exploring novel transformer designs, attention mechanisms, and architectural innovations for improved NLP performance.' },
    { id: 'cluster_pretraining_methods', label: 'Pre-training & Transfer Learning', summary: 'Research on self-supervised pre-training strategies, language model objectives, and effective knowledge transfer methods.' },
    { id: 'cluster_efficiency_scaling', label: 'Efficiency & Scaling', summary: 'Studies focused on making large models more efficient through distillation, pruning, quantization, and scaling laws.' },
  ];

  for (const cl of clusters) {
    await runQuery(
      `CREATE (cl:Cluster {id: $id, label: $label, summary: $summary, paperCount: 0})`,
      cl
    );
  }

  // Paper 1: Attention Is All You Need
  await createPaperWithRelations({
    paper: {
      id: 'paper_attention',
      title: 'Attention Is All You Need',
      abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.',
      year: 2017,
      summary: 'Introduced the Transformer architecture using self-attention mechanisms, replacing recurrence entirely. Achieved state-of-the-art results on machine translation benchmarks with significantly less training time.',
      doi: '10.48550/arXiv.1706.03762',
    },
    authors: [
      { id: 'author_vaswani', name: 'Ashish Vaswani', affiliation: 'Google Brain' },
      { id: 'author_shazeer', name: 'Noam Shazeer', affiliation: 'Google Brain' },
      { id: 'author_parmar', name: 'Niki Parmar', affiliation: 'Google Research' },
      { id: 'author_uszkoreit', name: 'Jakob Uszkoreit', affiliation: 'Google Research' },
    ],
    topics: [
      { id: 'topic_attention', name: 'Attention Mechanisms' },
      { id: 'topic_transformers', name: 'Transformer Architecture' },
      { id: 'topic_mt', name: 'Machine Translation' },
      { id: 'topic_seq2seq', name: 'Sequence-to-Sequence Models' },
    ],
    methods: [
      { id: 'method_self_attention', name: 'Multi-Head Self-Attention', description: 'Parallel attention heads computing scaled dot-product attention over queries, keys, and values.' },
      { id: 'method_positional_encoding', name: 'Positional Encoding', description: 'Sinusoidal position embeddings to inject sequence order information.' },
    ],
    claims: [
      { id: 'claim_att_1', text: 'The Transformer achieves 28.4 BLEU on WMT 2014 English-to-German translation, surpassing all previous models.', type: 'finding', confidence: 0.95 },
      { id: 'claim_att_2', text: 'Self-attention can fully replace recurrence for sequence modeling tasks.', type: 'conclusion', confidence: 0.9 },
      { id: 'claim_att_3', text: 'Multi-head attention allows the model to attend to information from different representation subspaces.', type: 'finding', confidence: 0.95 },
    ],
    datasets: [
      { id: 'dataset_wmt14', name: 'WMT 2014 English-German', description: '4.5M sentence pairs for machine translation evaluation.' },
      { id: 'dataset_wmt14_enfr', name: 'WMT 2014 English-French', description: '36M sentence pairs for large-scale translation.' },
    ],
    venue: { id: 'venue_neurips', name: 'NeurIPS 2017', type: 'conference' },
    keywords: [
      { id: 'kw_attention', term: 'attention' },
      { id: 'kw_transformer', term: 'transformer' },
      { id: 'kw_seq2seq', term: 'sequence-to-sequence' },
    ],
    citations: [],
    clusterId: 'cluster_transformer_architectures',
  });

  // Paper 2: BERT
  await createPaperWithRelations({
    paper: {
      id: 'paper_bert',
      title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
      abstract: 'We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers.',
      year: 2019,
      summary: 'Introduced bidirectional pre-training using masked language modeling and next sentence prediction. BERT achieved state-of-the-art on 11 NLP tasks and fundamentally changed how transfer learning is done in NLP.',
      doi: '10.48550/arXiv.1810.04805',
    },
    authors: [
      { id: 'author_devlin', name: 'Jacob Devlin', affiliation: 'Google AI Language' },
      { id: 'author_chang', name: 'Ming-Wei Chang', affiliation: 'Google AI Language' },
    ],
    topics: [
      { id: 'topic_transformers', name: 'Transformer Architecture' },
      { id: 'topic_pretraining', name: 'Pre-training' },
      { id: 'topic_transfer_learning', name: 'Transfer Learning' },
      { id: 'topic_nlu', name: 'Natural Language Understanding' },
    ],
    methods: [
      { id: 'method_mlm', name: 'Masked Language Modeling', description: 'Randomly masking input tokens and predicting the masked tokens for bidirectional pre-training.' },
      { id: 'method_nsp', name: 'Next Sentence Prediction', description: 'Binary classification of whether two sentences follow each other, learning sentence-level relationships.' },
      { id: 'method_finetuning', name: 'Fine-tuning', description: 'Adapting pre-trained model weights on downstream task-specific data.' },
    ],
    claims: [
      { id: 'claim_bert_1', text: 'Bidirectional pre-training is crucial for language understanding tasks, outperforming left-to-right models.', type: 'finding', confidence: 0.95 },
      { id: 'claim_bert_2', text: 'BERT advances the state-of-the-art on 11 NLP tasks including GLUE, SQuAD, and MultiNLI.', type: 'finding', confidence: 0.95 },
      { id: 'claim_bert_3', text: 'Pre-trained representations can reduce the need for heavily engineered task-specific architectures.', type: 'conclusion', confidence: 0.85 },
    ],
    datasets: [
      { id: 'dataset_glue', name: 'GLUE Benchmark', description: 'General Language Understanding Evaluation, a collection of NLU tasks.' },
      { id: 'dataset_squad', name: 'SQuAD 1.1/2.0', description: 'Stanford Question Answering Dataset for reading comprehension.' },
    ],
    venue: { id: 'venue_naacl', name: 'NAACL 2019', type: 'conference' },
    keywords: [
      { id: 'kw_bert', term: 'BERT' },
      { id: 'kw_pretraining', term: 'pre-training' },
      { id: 'kw_bidirectional', term: 'bidirectional' },
    ],
    citations: ['Attention Is All You Need'],
    clusterId: 'cluster_pretraining_methods',
  });

  // Paper 3: GPT-2
  await createPaperWithRelations({
    paper: {
      id: 'paper_gpt2',
      title: 'Language Models are Unsupervised Multitask Learners',
      abstract: 'Natural language processing tasks, such as question answering, machine translation, reading comprehension, and summarization, are typically approached with supervised learning on task-specific datasets. We demonstrate that language models begin to learn these tasks without any explicit supervision when trained on a new dataset of millions of webpages called WebText.',
      year: 2019,
      summary: 'Demonstrated that large-scale autoregressive language models (GPT-2) can perform multiple NLP tasks without task-specific training, supporting the zero-shot learning paradigm.',
      doi: '',
    },
    authors: [
      { id: 'author_radford', name: 'Alec Radford', affiliation: 'OpenAI' },
      { id: 'author_wu', name: 'Jeffrey Wu', affiliation: 'OpenAI' },
    ],
    topics: [
      { id: 'topic_transformers', name: 'Transformer Architecture' },
      { id: 'topic_lm', name: 'Language Modeling' },
      { id: 'topic_zero_shot', name: 'Zero-Shot Learning' },
      { id: 'topic_pretraining', name: 'Pre-training' },
    ],
    methods: [
      { id: 'method_autoregressive', name: 'Autoregressive Language Modeling', description: 'Left-to-right token prediction for generative pre-training.' },
      { id: 'method_bpe', name: 'Byte Pair Encoding', description: 'Subword tokenization method for handling open vocabulary.' },
    ],
    claims: [
      { id: 'claim_gpt2_1', text: 'Large language models can perform tasks in a zero-shot setting without fine-tuning.', type: 'finding', confidence: 0.85 },
      { id: 'claim_gpt2_2', text: 'Autoregressive (left-to-right) pre-training is sufficient for strong language understanding.', type: 'conclusion', confidence: 0.8 },
      { id: 'claim_gpt2_3', text: 'Model capacity scales predictably with dataset size and compute.', type: 'finding', confidence: 0.9 },
    ],
    datasets: [
      { id: 'dataset_webtext', name: 'WebText', description: '40GB of curated web text for large-scale language model training.' },
    ],
    venue: { id: 'venue_openai', name: 'OpenAI Technical Report', type: 'preprint' },
    keywords: [
      { id: 'kw_gpt', term: 'GPT' },
      { id: 'kw_zero_shot', term: 'zero-shot' },
      { id: 'kw_language_model', term: 'language model' },
    ],
    citations: ['Attention Is All You Need'],
    clusterId: 'cluster_pretraining_methods',
  });

  // Paper 4: DistilBERT
  await createPaperWithRelations({
    paper: {
      id: 'paper_distilbert',
      title: 'DistilBERT, a distilled version of BERT: smaller, faster, cheaper and lighter',
      abstract: 'As Transfer Learning from large-scale pre-trained models becomes more prevalent in NLP, operating these large models in on-the-edge and/or under constrained computational training or inference budgets remains challenging. We propose a method to pre-train a smaller general-purpose language representation model called DistilBERT.',
      year: 2019,
      summary: 'Proposed knowledge distillation for compressing BERT, achieving 97% of BERT performance with 40% fewer parameters and 60% faster inference.',
      doi: '10.48550/arXiv.1910.01108',
    },
    authors: [
      { id: 'author_sanh', name: 'Victor Sanh', affiliation: 'Hugging Face' },
      { id: 'author_debut', name: 'Lysandre Debut', affiliation: 'Hugging Face' },
    ],
    topics: [
      { id: 'topic_distillation', name: 'Knowledge Distillation' },
      { id: 'topic_efficiency', name: 'Model Efficiency' },
      { id: 'topic_transformers', name: 'Transformer Architecture' },
      { id: 'topic_transfer_learning', name: 'Transfer Learning' },
    ],
    methods: [
      { id: 'method_distillation', name: 'Knowledge Distillation', description: 'Training a smaller student model to mimic a larger teacher model\'s output distribution.' },
      { id: 'method_finetuning', name: 'Fine-tuning', description: 'Adapting pre-trained model weights on downstream task-specific data.' },
    ],
    claims: [
      { id: 'claim_distil_1', text: 'DistilBERT retains 97% of BERT performance while being 40% smaller.', type: 'finding', confidence: 0.95 },
      { id: 'claim_distil_2', text: 'Knowledge distillation is more effective than simple pruning for transformer compression.', type: 'conclusion', confidence: 0.8 },
      { id: 'claim_distil_3', text: 'Smaller models are necessary for edge deployment and real-time applications.', type: 'hypothesis', confidence: 0.9 },
    ],
    datasets: [
      { id: 'dataset_glue', name: 'GLUE Benchmark', description: 'General Language Understanding Evaluation.' },
    ],
    venue: { id: 'venue_emnlp_ws', name: 'EMNLPw 2019 Workshop', type: 'workshop' },
    keywords: [
      { id: 'kw_distillation', term: 'distillation' },
      { id: 'kw_efficiency', term: 'efficiency' },
      { id: 'kw_compression', term: 'compression' },
    ],
    citations: ['BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding', 'Attention Is All You Need'],
    clusterId: 'cluster_efficiency_scaling',
  });

  // Paper 5: Scaling Laws for Neural Language Models
  await createPaperWithRelations({
    paper: {
      id: 'paper_scaling',
      title: 'Scaling Laws for Neural Language Models',
      abstract: 'We study empirical scaling laws for language model performance on the cross-entropy loss. The loss scales as a power-law with model size, dataset size, and the amount of compute used for training, with some trends spanning more than seven orders of magnitude.',
      year: 2020,
      summary: 'Established empirical scaling laws showing that language model performance follows power-law relationships with model size, data, and compute. These findings have guided the development of larger and more capable language models.',
      doi: '10.48550/arXiv.2001.08361',
    },
    authors: [
      { id: 'author_kaplan', name: 'Jared Kaplan', affiliation: 'Johns Hopkins University' },
      { id: 'author_mccandlish', name: 'Sam McCandlish', affiliation: 'OpenAI' },
    ],
    topics: [
      { id: 'topic_scaling', name: 'Scaling Laws' },
      { id: 'topic_lm', name: 'Language Modeling' },
      { id: 'topic_efficiency', name: 'Model Efficiency' },
      { id: 'topic_training', name: 'Training Optimization' },
    ],
    methods: [
      { id: 'method_autoregressive', name: 'Autoregressive Language Modeling', description: 'Left-to-right token prediction.' },
      { id: 'method_scaling_analysis', name: 'Empirical Scaling Analysis', description: 'Systematic study of performance as a function of model, data, and compute scale.' },
    ],
    claims: [
      { id: 'claim_scaling_1', text: 'Language model loss follows a power-law relationship with model parameters, dataset tokens, and compute budget.', type: 'finding', confidence: 0.95 },
      { id: 'claim_scaling_2', text: 'Larger models are more sample-efficient than smaller ones.', type: 'finding', confidence: 0.9 },
      { id: 'claim_scaling_3', text: 'Optimal compute allocation favors training larger models on less data rather than smaller models on more data.', type: 'conclusion', confidence: 0.85 },
    ],
    datasets: [
      { id: 'dataset_webtext', name: 'WebText', description: 'Large-scale web corpus.' },
    ],
    venue: { id: 'venue_arxiv', name: 'arXiv', type: 'preprint' },
    keywords: [
      { id: 'kw_scaling', term: 'scaling laws' },
      { id: 'kw_power_law', term: 'power law' },
      { id: 'kw_compute', term: 'compute' },
    ],
    citations: ['Language Models are Unsupervised Multitask Learners', 'Attention Is All You Need'],
    clusterId: 'cluster_efficiency_scaling',
  });

  // Create SUPPORTS and CONTRADICTS relationships between claims
  await runQuery(`
    MATCH (c1:Claim {id: 'claim_bert_1'}), (c2:Claim {id: 'claim_gpt2_2'})
    MERGE (c1)-[:CONTRADICTS {description: 'BERT argues bidirectional pre-training is crucial, while GPT-2 shows autoregressive (unidirectional) models can achieve strong results'}]->(c2)
  `);

  await runQuery(`
    MATCH (c1:Claim {id: 'claim_att_2'}), (c2:Claim {id: 'claim_bert_1'})
    MERGE (c1)-[:SUPPORTS {description: 'The self-attention mechanism from Transformers enables the bidirectional pre-training used in BERT'}]->(c2)
  `);

  await runQuery(`
    MATCH (c1:Claim {id: 'claim_scaling_3'}), (c2:Claim {id: 'claim_distil_3'})
    MERGE (c1)-[:CONTRADICTS {description: 'Scaling laws suggest bigger models are better, while DistilBERT argues smaller models are needed for practical deployment'}]->(c2)
  `);

  await runQuery(`
    MATCH (c1:Claim {id: 'claim_gpt2_3'}), (c2:Claim {id: 'claim_scaling_1'})
    MERGE (c1)-[:SUPPORTS {description: 'GPT-2 observation about capacity scaling aligns with the formal scaling laws discovered later'}]->(c2)
  `);

  // Create RELATED_TO relationships between topics
  await runQuery(`
    MATCH (t1:Topic {id: 'topic_attention'}), (t2:Topic {id: 'topic_transformers'})
    MERGE (t1)-[:RELATED_TO]->(t2)
  `);
  await runQuery(`
    MATCH (t1:Topic {id: 'topic_pretraining'}), (t2:Topic {id: 'topic_transfer_learning'})
    MERGE (t1)-[:RELATED_TO]->(t2)
  `);
  await runQuery(`
    MATCH (t1:Topic {id: 'topic_distillation'}), (t2:Topic {id: 'topic_efficiency'})
    MERGE (t1)-[:RELATED_TO]->(t2)
  `);

  // Update cluster paper counts
  await runQuery(`
    MATCH (cl:Cluster)
    OPTIONAL MATCH (p:Paper)-[:BELONGS_TO_CLUSTER]->(cl)
    WITH cl, count(p) AS cnt
    SET cl.paperCount = cnt
  `);

  console.log('Demo data seeded successfully: 5 papers, 10 authors, 15 topics, 8 methods, 15 claims, 4 datasets, 3 clusters');
}
