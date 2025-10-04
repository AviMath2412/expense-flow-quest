import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, FileText, Eye } from 'lucide-react';
import { performOCR, type OCRResult } from '@/lib/ocr-service';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';

const OCRTest = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [rawText, setRawText] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setRawText('');
      setConfidence(0);
    }
  };

  const handleProcess = async () => {
    if (!file) return;

    setProcessing(true);
    try {
      // Import the OCR service function
      const { performReceiptOCR } = await import('@/lib/ocr-service');
      const ocrResult = await performReceiptOCR(file);
      
      setResult(ocrResult.extractedData);
      setRawText(ocrResult.rawText);
      setConfidence(ocrResult.confidence);
      
      toast({
        title: 'OCR Processing Complete',
        description: `Confidence: ${Math.round(ocrResult.confidence)}%`,
      });
    } catch (error) {
      console.error('OCR Error:', error);
      toast({
        title: 'OCR Failed',
        description: error instanceof Error ? error.message : 'Failed to process image',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            OCR Receipt Processing Test
          </h2>
          <p className="text-muted-foreground">
            Upload a receipt image to test the OCR functionality and see extracted data
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Receipt
              </CardTitle>
              <CardDescription>
                Select a receipt image to process with OCR
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="receipt-upload">Receipt Image</Label>
                <Input
                  id="receipt-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1"
                />
                {file && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
              
              <Button 
                onClick={handleProcess} 
                disabled={!file || processing}
                className="w-full"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Process Receipt
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Extracted Data
              </CardTitle>
              <CardDescription>
                OCR results and extracted receipt information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {confidence > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Confidence:</span>
                  <Badge variant={confidence > 70 ? 'default' : confidence > 40 ? 'secondary' : 'destructive'}>
                    {Math.round(confidence)}%
                  </Badge>
                </div>
              )}

              {result && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Amount</Label>
                    <p className="text-lg font-bold">
                      {result.currency} {result.amount?.toFixed(2) || 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Date</Label>
                    <p>{result.date || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Vendor</Label>
                    <p>{result.vendor || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <p>{result.category || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p>{result.description || 'N/A'}</p>
                  </div>
                  
                  {result.items && result.items.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Items</Label>
                      <div className="space-y-1">
                        {result.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.description}</span>
                            <span>{result.currency} {item.amount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Raw OCR Text */}
        {rawText && (
          <Card>
            <CardHeader>
              <CardTitle>Raw OCR Text</CardTitle>
              <CardDescription>
                The raw text extracted from the image by the OCR engine
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={rawText}
                readOnly
                className="min-h-[200px] font-mono text-sm"
                placeholder="Raw OCR text will appear here..."
              />
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              1. <strong>Upload a clear receipt image</strong> - JPG, PNG, or other image formats
            </p>
            <p className="text-sm text-muted-foreground">
              2. <strong>Click "Process Receipt"</strong> - The OCR engine will analyze the image
            </p>
            <p className="text-sm text-muted-foreground">
              3. <strong>Review extracted data</strong> - Check the confidence level and extracted information
            </p>
            <p className="text-sm text-muted-foreground">
              4. <strong>Use in expense submission</strong> - The data can be used to auto-fill expense forms
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default OCRTest;
