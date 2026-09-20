import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PortalLayout from '../components/layout/PortalLayout';
import Accordion from '../components/common/Accordion';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import { HelpCircle, Search, PhoneCall, Mail } from 'lucide-react';

const FAQPage = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const faqItems = [
    {
      id: 'faq-1',
      title: 'What is the ParivarSathi Unified Family ID (UFID)?',
      content: 'The Unified Family ID (UFID) is a unique 8-character identifier issued by the Government of Gujarat that links all members of a single household under one welfare umbrella. It enables automated discovery of all central and state welfare benefits without requiring repeated document submissions.'
    },
    {
      id: 'faq-2',
      title: 'How does automated scheme eligibility evaluation work?',
      content: 'ParivarSathi uses an automated rules engine that evaluates demographic and socio-economic attributes (such as household annual income, age, gender, occupation, caste category, and district of residence) against the official qualification criteria of Gujarat Government schemes.'
    },
    {
      id: 'faq-3',
      title: 'Is my Aadhaar number secure on this portal?',
      content: 'Yes. In strict compliance with UIDAI regulations and GIGW 3.0 standards, ParivarSathi does NOT store full 12-digit Aadhaar numbers. Only the last 4 digits are stored in masked format (•••• •••• XXXX) solely for deduplication and citizen verification.'
    },
    {
      id: 'faq-4',
      title: 'How do I add a new newborn child or newlywed spouse to my household?',
      content: 'Log in as the citizen family head, navigate to the Family Dashboard, click "Add Member", and complete the 4-step stepper with the member\'s birth details or marriage documentation. Once saved, eligibility for schemes like Vhali Dikri Yojana is evaluated immediately.'
    },
    {
      id: 'faq-5',
      title: 'How can I track the status of my submitted scheme application?',
      content: 'Navigate to "My Applications" from the top navigation bar. Every application displays an interactive visual tracker showing current review stages (Submitted > Verified by Block Officer > Approved > Benefit Disbursed to Bank Account).'
    },
    {
      id: 'faq-6',
      title: 'What should I do if my application is rejected?',
      content: 'Review the officer remarks listed in the Application Tracker modal. If there is a rectifiable discrepancy (such as updated income certificate), you can update your family profile or submit an appeal through the Public Grievance portal.'
    }
  ];

  const filteredFaqs = faqItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PortalLayout breadcrumbs={[{ label: t('nav.home'), to: '/' }, { label: t('nav.faq') }]}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2 py-4">
          <div className="inline-flex p-3 rounded-full bg-blue-50 text-gov-navy border border-blue-200">
            <HelpCircle size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gov-navy">
            Frequently Asked Questions & Citizen Helpdesk
          </h1>
          <p className="text-xs text-gov-text-muted max-w-xl mx-auto">
            Guidance on Unified Family ID registration, scheme rules, document guidelines, and Direct Benefit Transfer (DBT).
          </p>

          <div className="pt-2 max-w-md mx-auto">
            <Input
              placeholder="Search help topics (e.g. Aadhaar, Income, Tracking)..."
              icon={Search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card title="Portal Help & Guidance">
          {filteredFaqs.length === 0 ? (
            <p className="text-xs text-gov-text-muted text-center py-6">
              No matching help topics found. Please contact the helpline below.
            </p>
          ) : (
            <Accordion items={filteredFaqs} allowMultiple={false} />
          )}
        </Card>

        {/* Helpline Contact Card */}
        <div className="bg-slate-50 border border-gov-border rounded-md p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-bold text-sm text-gov-navy">Still need assistance?</h3>
            <p className="text-xs text-gov-text-muted">
              Our citizen helpdesk is available Monday to Saturday, 9:30 AM to 6:00 PM.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-gov-border px-3 py-2 rounded text-xs font-bold text-gov-navy">
              <PhoneCall size={14} className="text-gov-green" />
              <span>1800-233-5500</span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-gov-border px-3 py-2 rounded text-xs font-bold text-gov-navy">
              <Mail size={14} className="text-gov-saffron" />
              <span>support-parivarsathi@gujarat.gov.in</span>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};

export default FAQPage;
