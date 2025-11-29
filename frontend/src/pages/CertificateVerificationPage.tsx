import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { verifyCertificate } from '../services/certificateService';
import { CertificateVerification } from '../types/certificate';

const CertificateVerificationPage = () => {
  const { verificationCode } = useParams<{ verificationCode: string }>();
  const [verification, setVerification] = useState<CertificateVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!verificationCode) {
      setError('No verification code provided');
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const data = await verifyCertificate(verificationCode);
        setVerification(data);
      } catch (err) {
        setError('Certificate not found or invalid verification code');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [verificationCode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center camo-background">
        <div className="holographic-spinner w-16 h-16"></div>
      </div>
    );
  }

  if (error || !verification) {
    return (
      <div className="min-h-screen flex items-center justify-center camo-background px-4">
        <div className="glassmorphic-elevated p-8 rounded-2xl max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-glossy-black mb-4">
            Certificate Not Found
          </h1>
          <p className="text-steel-grey">
            {error || 'The certificate could not be verified. Please check the verification code and try again.'}
          </p>
        </div>
      </div>
    );
  }

  const { certificate } = verification;
  const formattedDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 camo-background">
      <div className="max-w-4xl mx-auto">
        {/* Verification Status */}
        <div className="text-center mb-8">
          <div className="inline-block holographic-border rounded-full p-6 mb-4">
            <div className="text-6xl">✓</div>
          </div>
          <h1 className="text-3xl font-bold text-success-teal mb-2">
            Certificate Verified
          </h1>
          <p className="text-steel-grey">
            This certificate is authentic and has been issued by SoloSuccess Intel Academy
          </p>
        </div>

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
            <h2 className="text-4xl md:text-5xl font-bold text-hot-pink mb-4">
              Certificate of Completion
            </h2>
            <p className="text-xl text-glossy-black mb-8">
              SoloSuccess Intel Academy
            </p>

            <p className="text-lg text-steel-grey mb-4">This certifies that</p>

            <h3 className="text-3xl md:text-4xl font-bold text-glossy-black mb-6">
              {certificate.user?.firstName} {certificate.user?.lastName}
            </h3>

            <p className="text-lg text-steel-grey mb-4">has successfully completed</p>

            <h4 className="text-2xl md:text-3xl font-bold text-hot-pink mb-8">
              {certificate.course?.title}
            </h4>

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

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-steel-grey">
            This certificate can be verified at any time using the verification code above.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CertificateVerificationPage;
