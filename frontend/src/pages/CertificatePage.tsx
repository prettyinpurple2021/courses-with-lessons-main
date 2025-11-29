import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCertificateById, downloadCertificatePDF, shareCertificate } from '../services/certificateService';
import { Certificate, ShareCertificateResponse } from '../types/certificate';
import { useToast } from '../hooks/useToast';

const CertificatePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [shareData, setShareData] = useState<ShareCertificateResponse | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate('/dashboard');
      return;
    }

    const fetchCertificate = async () => {
      try {
        const data = await getCertificateById(id);
        setCertificate(data);
      } catch (err) {
        showError('Failed to load certificate');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [id, navigate, showError]);

  const handleDownload = async () => {
    if (!id) return;

    setDownloading(true);
    try {
      const blob = await downloadCertificatePDF(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${certificate?.course?.title || 'download'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      success('Certificate downloaded successfully');
    } catch (err) {
      showError('Failed to download certificate');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!id) return;

    try {
      const data = await shareCertificate(id);
      setShareData(data);
      setShowShareModal(true);
    } catch (err) {
      showError('Failed to generate share link');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    success('Copied to clipboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="holographic-spinner w-16 h-16"></div>
      </div>
    );
  }

  if (!certificate) {
    return null;
  }

  const formattedDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 camo-background">
      <div className="max-w-4xl mx-auto">
        {/* Certificate Display */}
        <div className="glassmorphic p-8 md:p-12 rounded-2xl border-4 border-girly-pink relative overflow-hidden">
          {/* Camo border pattern */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-girly-pink via-steel-grey to-girly-pink"></div>
            <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-girly-pink via-steel-grey to-girly-pink"></div>
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-girly-pink via-steel-grey to-girly-pink"></div>
            <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-girly-pink via-steel-grey to-girly-pink"></div>
          </div>

          {/* Certificate Content */}
          <div className="relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-hot-pink mb-4">
              Certificate of Completion
            </h1>
            <p className="text-xl text-glossy-black mb-8">
              SoloSuccess Intel Academy
            </p>

            <p className="text-lg text-steel-grey mb-4">This certifies that</p>

            <h2 className="text-3xl md:text-4xl font-bold text-glossy-black mb-6">
              {certificate.user?.firstName} {certificate.user?.lastName}
            </h2>

            <p className="text-lg text-steel-grey mb-4">has successfully completed</p>

            <h3 className="text-2xl md:text-3xl font-bold text-hot-pink mb-8">
              {certificate.course?.title}
            </h3>

            <p className="text-base text-glossy-black mb-8">
              Issued on {formattedDate}
            </p>

            {/* Holographic Verification Seal */}
            <div className="inline-block holographic-border rounded-full p-4 mb-6">
              <div className="text-success-teal font-bold text-sm">
                ★ VERIFIED ★
              </div>
            </div>

            <p className="text-sm text-steel-grey">
              Verification Code: <span className="font-mono font-bold">{certificate.verificationCode}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="holographic-button px-8 py-3 rounded-lg font-semibold text-white bg-hot-pink hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? 'Downloading...' : 'Download PDF'}
          </button>

          <button
            onClick={handleShare}
            className="glassmorphic px-8 py-3 rounded-lg font-semibold text-glossy-black hover:scale-105 transition-transform border-2 border-hot-pink"
          >
            Share Certificate
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="glassmorphic px-8 py-3 rounded-lg font-semibold text-glossy-black hover:scale-105 transition-transform"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Share Modal */}
        {showShareModal && shareData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="glassmorphic-elevated p-8 rounded-2xl max-w-md w-full">
              <h3 className="text-2xl font-bold text-hot-pink mb-4">Share Certificate</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-glossy-black mb-2">
                  Share URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareData.shareUrl}
                    readOnly
                    className="flex-1 px-4 py-2 rounded-lg bg-white bg-opacity-20 border border-steel-grey text-glossy-black"
                  />
                  <button
                    onClick={() => copyToClipboard(shareData.shareUrl)}
                    className="px-4 py-2 bg-hot-pink text-white rounded-lg hover:scale-105 transition-transform"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-glossy-black mb-2">
                  Verification Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareData.verificationCode}
                    readOnly
                    className="flex-1 px-4 py-2 rounded-lg bg-white bg-opacity-20 border border-steel-grey text-glossy-black font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(shareData.verificationCode)}
                    className="px-4 py-2 bg-hot-pink text-white rounded-lg hover:scale-105 transition-transform"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2 bg-[#0077B5] text-white rounded-lg text-center hover:scale-105 transition-transform"
                >
                  LinkedIn
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareData.shareUrl)}&text=I%20just%20completed%20${encodeURIComponent(certificate.course?.title || 'a course')}%20at%20SoloSuccess%20Intel%20Academy!`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2 bg-[#1DA1F2] text-white rounded-lg text-center hover:scale-105 transition-transform"
                >
                  Twitter
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2 bg-[#1877F2] text-white rounded-lg text-center hover:scale-105 transition-transform"
                >
                  Facebook
                </a>
              </div>

              <button
                onClick={() => setShowShareModal(false)}
                className="mt-6 w-full px-4 py-2 glassmorphic rounded-lg hover:scale-105 transition-transform"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificatePage;
