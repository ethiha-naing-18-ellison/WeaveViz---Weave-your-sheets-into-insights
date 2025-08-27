import React from 'react';
import { Github, Linkedin, Mail, Phone, ArrowRight, BarChart3, Database, FileText, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info & Logo */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="WeaveViz Logo" className="w-8 h-8" />
              <h3 className="text-xl font-bold">WeaveViz</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Weave your sheets into insights. Transform your data into beautiful, interactive dashboards.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://github.com/ethiha-naing-18-ellison" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="https://www.linkedin.com/in/thiha-naing-18t43" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard Builder
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <Database className="w-4 h-4 mr-2" />
                  Data Management
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* CTA Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Get Started</h4>
            <p className="text-gray-300 text-sm">
              Ready to transform your data? Start building beautiful dashboards today.
            </p>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <p className="text-xs text-gray-400">
              No credit card required • 14-day free trial
            </p>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">Thiha Naing</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">Position:</span>
                <span className="text-gray-300">Software Engineer, Data Analyst</span>
              </div>
              <a 
                href="mailto:thiha.naing.codev@gmail.com" 
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4 text-gray-400" />
                <span>thiha.naing.codev@gmail.com</span>
              </a>
              <a 
                href="tel:+60187799581" 
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 text-gray-400" />
                <span>+60187799581</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 WeaveViz. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
